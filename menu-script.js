/*******************************************************************************
  This file is part of TrackMeNot (Chrome version).

  TrackMeNot is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation,  version 2 of the License.

  TrackMeNot is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with TrackMeNot.  If not, see <http://www.gnu.org/licenses/>.
 ********************************************************************************/

if(!TRACKMENOT) var TRACKMENOT = {};

TRACKMENOT.Menus = function() {
  var tmn = null;
  var tmn_option_query = '';
  var tmn_option_engine = '';
  var options = null;

  function  _cout (msg) { console.log(msg);  }

  return {
    showHelp: function() {
      window.open("http://www.cs.nyu.edu/trackmenot/faq.html");
    },

    toggleOnOff: function() {
      options.enabled = !options.enabled;
      if( !options.enabled) tmn._stopTMN();
      else  tmn._restartTMN();

      tmn._saveOptions();
      TRACKMENOT.Menus.onLoadMenu();
    },

    toggleTabFrame: function() {
      options.useTab = !options.useTab;
      tmn._changeTabStatus(options.useTab);
      tmn._saveOptions();
      TRACKMENOT.Menus.onLoadMenu();
    },


    onLoadMenu: function( ) {
      tmn = chrome.extension.getBackgroundPage().TRACKMENOT.TMNSearch;
      options = tmn._getOptions();
      tmn_option_query = tmn._getQuery();
      tmn_option_engine =  tmn._getEngine();

      $("#trackmenot-label").html(tmn_option_engine + " '"+ tmn_option_query+"'");


      if ( options.enabled) {
        $("#trackmenot-enabled").html('Disable');
        $("#trackmenot-img-enabled").attr("src", "images/skin/off_icon.png");
      }  else {
        $("#trackmenot-enabled").html('Enable');
        $("#trackmenot-img-enabled").attr("src", "images/skin/on_icon.png");
      }

      if (options.useTab)
        $("#trackmenot-menu-useTab").html('Stealth');
      else
        $("#trackmenot-menu-useTab").html('Tab');
    }
  };
}();

document.addEventListener('DOMContentLoaded', function () {
  $("#trackmenot-menu-useTab").click(TRACKMENOT.Menus.toggleTabFrame);
  $("#trackmenot-enabled").click(TRACKMENOT.Menus.toggleOnOff);
  $("#trackmenot-menu-win").click(function() { window.open(chrome.extension.getURL('options.html'));});
  $("#trackmenot-menu-help").click(TRACKMENOT.Menus.showHelp);
  TRACKMENOT.Menus.onLoadMenu();
});
