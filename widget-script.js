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

function updateText(text) {
  document.getElementById("tmn-text").innerHTML = text;
  console.log("Updating text on widget with: "+ text);
}

function UpdateIcon(url) {
  document.getElementById("tmn-widget-icon").setAttribute("src",url);
}

self.port.on("UpdateText", updateText);
self.port.on("UpdateIcon", UpdateIcon);
