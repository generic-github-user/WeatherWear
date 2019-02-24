var uid = 029592308593258;
var undoBuffer;
var tempRanges = [{
            'name': 'Cold',
            'minTemp': 0
      },
      {
            'name': 'Cool',
            'minTemp': 35
      },
      {
            'name': 'Medium',
            'minTemp': 50
      },
      {
            'name': 'Warm',
            'minTemp': 65
      },
      {
            'name': 'Hot',
            'minTemp': 75
      }
];

function cToF(temp) {
      return (temp * (9 / 5)) + 32;
}

var weatherData;
// Get weather for Westminster, Maryland
$.get("https://api.weather.gov/points/39.5830,-77.0037", (paths) => {
      console.log(paths)
      $.get(paths.properties.forecastGridData, (data) => {
            weatherData = data;
            currentTemperature = weatherData.properties.apparentTemperature.values[0].value;
            currentTemperature = Math.round(cToF(currentTemperature));
            console.log('The current temperature is ' + currentTemperature);
      })
});

// Display snackbar
function displaySnackbar(data) {
      const snackbar = $('#snackbar');
      // snackbar.find('.mdl-snackbar__text').text(msg);
      snackbar[0].MaterialSnackbar.showSnackbar(data);
}

// Undo a clothing deletion
function undoDelete(event) {
      const ref = database.ref('users/' + uid + '/clothing/' + undoBuffer.id);
      ref.set(undoBuffer.data);
      addClothingTile('#closet', undoBuffer.id, undoBuffer.data);
}

// Add a visual representation of a clothing item
function addClothingTile(container, id, data) {
      $.get("./card.html", function(html) {
            const card = $(html);
            card.addClass('clothing-' + id);
            card.attr("style", "background: url('" + data.url + "') center / cover;");
            card.find('button').attr('onclick', 'removeClothing(' + id + ')');

            card.find('.demo-card-image__filename').text(data.name)
            card.find('.formality').text(data.formality)
            card.find('.type').text(data.type)
            card.find('.temperature').text(data.temperature + ' temperature')

            $(container).append(card);
            return card;
            // .find('.demo-card-image.mdl-card')
      });
}

// Load all items in closet
function loadCloset() {
      database.ref('users/' + uid + '/clothing').once('value').then(
            (snapshot) => {
                  if (snapshot) {
                        const data = snapshot.val();
                        for (var property in data) {
                              // const card = $('#closet').load('./card.html');
                              // const url = data[property].url;
                              addClothingTile('#closet', property, data[property]);
                        }
                  }
            }
      )
}

// Remove a single piece of clothing from the user's closet
function removeClothing(cID) {
      const ref = database.ref('users/' + uid + '/clothing/' + cID);
      ref.once('value').then(
            (snapshot) => {
                  undoBuffer = {
                        'id': cID,
                        'data': snapshot.val()
                  };
                  ref.remove();
                  $('.clothing-' + cID).remove();
            }
      );

      var data = {
            message: 'Clothing removed from your closet.',
            timeout: 5000,
            actionHandler: undoDelete,
            actionText: 'Undo'
      };
      displaySnackbar(data);
}

function removeAll() {
      const ref = database.ref('users/' + uid + '/clothing');
      ref.once('value').then(
            (snapshot) => {
                  undoBuffer = {
                        'id': undefined,
                        'data': snapshot.val()
                  };
                  ref.remove();
                  $('.clothing-tile').remove();
            }
      );
      var data = {
            message: 'All items in closet removed.',
            timeout: 10000,
            actionHandler: (event) => {
                  ref.set(undoBuffer.data);
                  loadCloset();
            },
            actionText: 'Undo'
      };
      displaySnackbar(data);
}

$(document).ready(
      () => {
            var noFriendsMsgs = [
                  'You have no friends!',
                  'Nothing here, try again tomorrow.'
            ];
            var dialog = $('#add-clothing-dialog');

            function addClothing() {
                  dialog[0].showModal()
            }

            $('#add-clothing').click(addClothing);
            $('#remove-all').click(removeAll);

            dialog.find('.close').click(function() {
                  dialog[0].close();
            });

            function addClothingUpload() {
                  const cID = Math.ceil(Math.random() * 1e9);
                  const ref = storage.ref();
                  const file = document.querySelector('#upload').files[0]
                  console.log(file)

                  const name = (+new Date()) + '-' + file.name;
                  const metadata = {
                        contentType: file.type
                  };
                  const task = ref.child(name).put(file, metadata);
                  task.then(snapshot => {
                              const url = snapshot.ref.getDownloadURL();
                              // console.log(clothingRef)
                              var data = {
                                    message: 'File uploaded.',
                                    timeout: 5000,
                                    actionHandler: (event) => {
                                          // clothingRef.remove()
                                    },
                                    actionText: 'Undo'
                              };
                              displaySnackbar(data);
                              return url;
                        })
                        .then((url) => {
                              const clothingRef = database.ref('users/' + uid + '/clothing/' + cID);
                              console.log('File successfully uploaded', url);
                              // document.querySelector('#image-preview').src = url;
                              clothingData = {
                                    'url': url,
                                    'name': $('#clothing-name')[0].value,
                                    'formality': $('#formality')[0].value,
                                    'type': $('#type')[0].value,
                                    'temperature': $('#temperature')[0].value
                              };
                              clothingRef.set(clothingData);
                              addClothingTile('#closet', cID, clothingData);
                        })
                        .catch(console.error);
            }
            dialog.find('.confirm').click(addClothingUpload);

            const friendsRef = database.ref('users/' + uid + '/friends');
            friendsRef.once('value', (snapshot) => {
                  const friends = snapshot.val();

                  // if (!friends) {
                  //       friendsRef.set({
                  //             0: 0
                  //       })
                  // }
                  // if (!friends['0']) {
                  //       const msg = noFriendsMsgs[Math.floor(Math.random() * noFriendsMsgs.length)];
                  //       $('#friends').append('<p id="noFriends">' + msg + '</p>')
                  // }

                  if (!friends) {
                        friendsRef.set({
                              0: 0
                        })
                  }
                  if (!friends['0']) {
                        const msg = noFriendsMsgs[Math.floor(Math.random() * noFriendsMsgs.length)];
                        $('#friends').append('<p id="noFriends">' + msg + '</p>')
                  }
            })

            loadCloset();

            function updateToday() {
                  console.log(true);
                  const formalityFilterVal = $('#formality-filter')[0].value;
                  const typeFilterVal = $('#type-filter')[0].value;

                  const ref = database.ref('users/' + uid + '/clothing');
                  $('#suggestions-list').empty();
                  ref.once('value', (snapshot) => {
                        const data = snapshot.val();
                        // const index = tempRanges.findIndex((x) => {
                        //       x.name == data[property].name
                        // })
                        var tempBracket;
                        t = currentTemperature;
                        for (var i = 0; i < tempRanges.length; i++) {
                              if (tempRanges[i - 1] == undefined) {
                                    min = -459.67;
                              } else {
                                    min = tempRanges[i].minTemp;
                              }

                              if (tempRanges[i + 1] == undefined) {
                                    max = 1000;
                              } else {
                                    max = tempRanges[i + 1].minTemp;
                              }

                              // if (tempRanges[i - 1] !== undefined && tempRanges[i + 1] !== undefined) {
                              //       tempRanges[i].avgRangeTemp = (min + max) / 2;
                              // } else if (tempRanges[i - 1] == undefined) {
                              //       tempRanges[i].avgRangeTemp = tempRanges[i].minTemp;
                              // } else if (tempRanges[i + 1] == undefined) {
                              //       tempRanges[i].avgRangeTemp = tempRanges[i].minTemp;
                              // }

                              if (tempRanges[i - 1] !== undefined && tempRanges[i + 1] !== undefined) {
                                    tempRanges[i].avgRangeTemp = (min + max) / 2;
                              } else if (tempRanges[i - 1] == undefined) {
                                    tempRanges[i].avgRangeTemp = tempRanges[i].minTemp;
                              } else if (tempRanges[i + 1] == undefined) {
                                    tempRanges[i].avgRangeTemp = tempRanges[i].minTemp;
                              }

                              if (t >= min && t < max) {
                                    tempBracket = tempRanges[i];
                                    console.log(true)
                              }
                              // console.log(min);
                              // console.log(max);
                        }

                        var matches = [];
                        for (var property in data) {
                              const cID = property;
                              const clothing = data[cID];
                              clothing.id = cID;
                              // if (temperature > tempRanges[index]) {
                              //    $('#suggestions').append()
                              // }
                              // console.log("fff " + JSON.stringify(formalityFilterVal))
                              // clothing.score = Math.abs(currentTemperature - tempBracket.avgRangeTemp);
                              const bracket = tempRanges.find((x) => {
                                    return x.name == clothing.temperature
                              });
                              clothing.score = Math.abs(currentTemperature - bracket.avgRangeTemp);
                              if (clothing.score < 35 && (clothing.formality == formalityFilterVal || formalityFilterVal == '' || formalityFilterVal == 'All') && (clothing.type == typeFilterVal || typeFilterVal == '' || typeFilterVal == 'All')) {
                                    // $('#suggestions').append(clothing.name);
                                    matches.push(clothing);
                                    // $('#suggestions-list').find('.clothing-' + cID).addClass('clothing-tile');
                              }
                              console.log(name);
                        }
                        matches.sort(function(x, y) {
                              if (x.score < y.score) {
                                    return -1;
                              }
                              if (x.score > y.score) {
                                    return 1;
                              }
                              return 0;
                        });
                        console.log(matches)
                        matches.forEach((clothing) => {
                              addClothingTile('#suggestions-list', clothing.id, clothing);
                        });
                        console.log(data);
                  });
            }
            $('#home-button').click(updateToday);
            $('#formality-filter').change(updateToday);
            $('#type-filter').change(updateToday);
            updateToday();
      }
)