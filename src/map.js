// tomtom.setProductInfo('MapsWebSDKExamples', '4.46.3');
// var map = tomtom.map('map', {
//       key: config.maps.apiKey,
//       source: 'vector',
//       basePath: '<your-tomtom-sdk-base-path>'
// });
// var languageLabel = L.DomUtil.create('label');
// languageLabel.innerHTML = 'Maps language';
// var languageSelector = tomtom.languageSelector.getHtmlElement(tomtom.globalLocaleService, 'maps');
// languageLabel.appendChild(languageSelector);
// tomtom.controlPanel({
//             position: 'bottomright',
//             title: 'Settings',
//             collapsed: true,
//             closeOnMapClick: false
//       })
//       .addTo(map)
//       .addContent(languageLabel);

$(document).ready(
      () => {
            tomtom.setProductInfo('MapsWebSDKExamples', '4.46.3');
            map = tomtom.L.map('map-display', {
                  key: config.maps.apiKey,
                  center: [39.5830, -77.0037],
                  zoom: 15
            });
            // map.centerOn(
            //       39.5830,
            //       -77.0037,
            //       5,
            //       0
            // )
      }
)