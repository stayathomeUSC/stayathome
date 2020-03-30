/*global $*/
/*global L*/

var SHOW_WARNINGS = false;
var warningString = ''; /* Warning Log */
var participantList = ''; /* List of participants */

/*
 * Initialize Map
 */
L.mapbox.accessToken = 'pk.eyJ1IjoiYW5keS1ydXRrb3dza2kiLCJhIjoiWDJRMFVUWSJ9.iHl6Cf0M79wmHQlfP6Bk8Q';
var mymap = L.map('map').setView([34.0522, -118.2437], 9);
L.mapbox.styleLayer('mapbox://styles/andy-rutkowski/cjsp2c14p04zj1fmetikh16km').addTo(mymap); // base layer

var overlayMaps = {
};


/*
 * Pull data and display on page
 */
$(function() {
   getGoogleSheetData();
   L.control.layers(overlayMaps).addTo(mymap);
});

function getGoogleSheetData() {
    /*
    https://spreadsheets.google.com/feeds/worksheets/1oehdExbiplCpNuzVO5k3c_PPL_QwLWYWMS7bIvhkiNU/public/basic?alt=json
    https://spreadsheets.google.com/feeds/list/1oehdExbiplCpNuzVO5k3c_PPL_QwLWYWMS7bIvhkiNU/public/values?alt=json
    */
    
    var spreadsheetID = '1oehdExbiplCpNuzVO5k3c_PPL_QwLWYWMS7bIvhkiNU';
    var worksheetID = 'oqolfyh'; // Sheet 1: orfa4yj
    var url = 'https://spreadsheets.google.com/feeds/list/' + spreadsheetID + '/' + worksheetID + '/public/values?alt=json';
    
    /*
     * Iterate through each 
     * participant's submission.
     */
    $.getJSON(url, function(data) {
       $.each(data.feed.entry, function(i, val) {
          "console.log(val)"
           displayOnPage(val); 
       });
    });
    
    // Log Warnings
    if (SHOW_WARNINGS) {
        $('#main-content').append('<strong>Warnings: </strong><br>' + (warningString == '' ? 'No errors!' : warningString) + '<br><br>');
    }
}

function displayOnPage(row, warningString) {
    var name = '';
    if (row.gsx$name.$t == '') {
        name = 'anonymous'
    } else {
        name = row.gsx$name.$t;
    }
    
    var name_slug = name.replace(/\s+/g, '');
    var markers = [];
    
    
    
    /*
     * Add marker for each location
     * provided by participant.
     */
    for (var i=1; i<5; i++) {
        var lat = row['gsx$location' + i + 'lat'].$t;
        var lng = row['gsx$location' + i + 'lng'].$t;
        var locationName = row['gsx$location' + i + 'name'].$t;
        var description = row['gsx$location' + i + 'description'].$t;
        
        if (lat == '' || lng == '') {
            warningString += name + ' has no coordinates for Location ' + i + '.<br>';
        } else {
            var $locationInfo = $("<div>", {
               // "id": name_slug + i,
               "class": "location-data " // + name_slug + "-marker"
            });
            
            // Build popup window
            $locationInfo.append('<h1>' + locationName + '</h1>');
            $locationInfo.append('<em>' + name + '</em><br><br>');
            $locationInfo.append('<p>' + description + '</p>');
            
            var m = L.marker([lat, lng])
                .on('click', onMarkerClick)
                .bindPopup($locationInfo[0])
                .addTo(mymap);
            
            markers.push(m);
        }
        
        overlayMaps[name_slug] = L.layerGroup(markers);
    }
    
    /* 
     * Add list entry for each participant
     * so that when their name is clicked,
     * their markers are highlighted.
     */
    var $participant = $("<a>", {
        "href": '#'
    });
    
    $participant.append(name);
    $participant.click(function() {
        
    });
}

function onMarkerClick(e) {
    
    var popup = e.target.getPopup();
    var content = popup.getContent();
    $('#location-detail').html(content.innerHTML);
    event.target.closePopup();
}
