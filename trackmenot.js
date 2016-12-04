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

let _ = browser.i18n.getMessage;

if(!TRACKMENOT)
  var TRACKMENOT = {};

TRACKMENOT.TMNSearch = function() {
    let tmn_tab_id = -1;
    let tmn_tab = null;
    let useTab = false;
    let enabled = true;
    let debug_ = false;
    let load_full_pages = false;
    let last_url = "";
    let stop_when = "start";
    let useIncrementals = true;
    let incQueries = [];
    let searchEngines = "google";
    let engine = 'google';
    let useRss = true;
    let useUserList = false;
    let TMNQueries = {};
    let branch =  "extensions.trackmenot.";
    let feedList = 'http://www.techmeme.com/index.xml|http://rss.slashdot.org/Slashdot/slashdot|http://feeds.nytimes.com/nyt/rss/HomePage';
    let tmnLogs = [];
    let disableLogs = false;
    let saveLogs =  true;
    let kwBlackList = [];
    let useBlackList = true;
    let useDHSList = false;
    let typeoffeeds = [];
    let zeitgeist = ["facebook","youtube","myspace","craigslist","ebay","yahoo","walmart","netflix","amazon","home depot","best buy","Kentucky Derby","NCIS","Offshore Drilling","Halle Berry","iPad Cases","Dorothy Provine","Emeril","Conan O'Brien","Blackberry","Free Comic Book Day"," American Idol","Palm","Montreal Canadiens","George Clooney","Crib Recall","Auto Financing","Katie Holmes","Madea's Big Happy Family","Old Navy Coupon","Sandra Bullock","Dancing With the Stars","M.I.A.","Matt Damon","Santa Clara County","Joey Lawrence","Southwest Airlines","Malcolm X","Milwaukee Bucks","Goldman Sachs","Hugh Hefner","Tito Ortiz","David McLaughlin","Box Jellyfish","Amtrak","Molly Ringwald","Einstein Horse","Oil Spill"," Bret Michaels","Mississippi Tornado","Stephen Hawking","Kelley Blue Book","Hertz","Mariah Carey","Taiwan Earthquake","Justin Bieber","Public Bike Rental","BlackBerry Pearl","NFL Draft","Jillian Michaels","Face Transplant","Dell","Jack in the Box","Rebbie Jackson","Xbox","Pampers","William Shatner","Earth Day","American Idol","Heather Locklear","McAfee Anti-Virus","PETA","Rihanna","South Park","Tiger Woods","Kate Gosselin","Unemployment","Dukan Diet","Oil Rig Explosion","Crystal Bowersox","New 100 Dollar Bill","Beastie Boys","Melanie Griffith","Borders","Tara Reid","7-Eleven","Dorothy Height","Volcanic Ash","Space Shuttle Discovery","Gang Starr","Star Trek","Michael Douglas","NASCAR","Isla Fisher","Beef Recall","Rolling Stone Magazine","ACM Awards","NASA Space Shuttle","Boston Marathon","Iraq","Jennifer Aniston"];
    let tmn_timeout = 6000;
    let prev_engine = "None";
    let burstEngine = '';
    let burstTimeout = 6000;
    let burstEnabled = false;
    let tmn_searchTimer =null;
    let burstCount = 0;
    let tmn_id = 0;
    let tmn_logged_id = 0;
    let tmn_mode = 'timed';
    let tmn_errTimeout = null;
    let tmn_scheduledSearch = false;
    let tmn_query='No query sent yet';
    let currentTMNURL = '';
    let tmn_option_tab = null;
    let worker_tab, worker_opt;

    let skipex =new Array(
      /calendar/i,/advanced/i,/click /i,/terms/i,/Groups/i,
      /Images/,/Maps/,/search/i,/cache/i,/similar/i,/&#169;/,
      /sign in/i,/help[^Ss]/i,/download/i,/print/i,/Books/i,/rss/i,
      /google/i,/bing/i,/yahoo/i,/aol/i,/html/i,/ask/i,/xRank/,
      /permalink/i,/aggregator/i,/trackback/,/comment/i,/More/,
      /business solutions/i,/result/i,/ view /i,/Legal/,/See all/,
      /links/i,/submit/i,/Sites/i,/ click/i,/Blogs/,/See your mess/,
      /feedback/i,/sponsored/i,/preferences/i,/privacy/i,/News/,
      /Finance/,/Reader/,/Documents/,/windows live/i,/tell us/i,
      /shopping/i,/Photos/,/Video/,/Scholar/,/AOL/,/advertis/i,
      /Webmasters/,/MapQuest/,/Movies/,/Music/,/Yellow Pages/,
      /jobs/i,/answers/i,/options/i,/customize/i,/settings/i,
      /Developers/,/cashback/,/Health/,/Products/,/QnABeta/,
      /<more>/,/Travel/,/Personals/,/Local/,/Trademarks/,
      /cache/i,/similar/i,/login/i,/mail/i,/feed/i
    );

	let testAd_google = function(anchorClass,anchorlink) {
    return (
      anchorlink &&
      (
        anchorClass=='l' ||
        anchorClass=='l vst'
      ) &&
      anchorlink.indexOf('http') === 0 &&
      anchorlink.indexOf('https') !== 0
    );
  };

	let testAd_yahoo= function(anchorClass,anchorlink) {
    return ( anchorClass=='\"yschttl spt\"' || anchorClass=='yschttl spt');
  };

	let  testAd_aol = function(anchorClass,anchorlink) {
    return (
      anchorClass=='\"find\"' ||
      anchorClass=='find' &&
      anchorlink.indexOf('https') !== 0 &&
      anchorlink.indexOf('aol') < 0
    );
  };

	let testAd_bing = function(anchorClass,anchorlink) {
    return (
      anchorlink &&
      anchorlink.indexOf('http') === 0 &&
      anchorlink.indexOf('https') !== 0 &&
      anchorlink.indexOf('msn')<0 &&
      anchorlink.indexOf('live')<0 &&
      anchorlink.indexOf('bing')<0 &&
      anchorlink.indexOf('microsoft')<0 &&
      anchorlink.indexOf('WindowsLiveTranslator')<0
    );
  };

	let  testAd_baidu = function(anchorClass,anchorlink) {
    return (
      anchorlink &&
      anchorlink.indexOf('baidu') < 0 &&
      anchorlink.indexOf('https') !== 0
    );
  };

	let getButton_google =" let getButton = function(  ) {let button = getElementsByAttrValue(document,'button', 'name', 'btnG' );		if ( !button ) button = getElementsByAttrValue(document,'button', 'name', 'btnK' );return button;}";
	let getButton_yahoo= " let getButton = function(  ) {return getElementsByAttrValue(document,'input', 'class', 'sbb' ); } ";
	let getButton_bing= " let getButton = function(  ) {return document.getElementById('sb_form_go');}  ";
	let getButton_aol = " let getButton = function (  ) {return document.getElementById('csbbtn1');   }";
	let getButton_baidu = " let getButton = function (  ){ return getElementsByAttrValue(document,'input', 'value', '????' ); }";

  SearchBox_google = "let searchbox = function( ) { return getElementsByAttrValue(document,'input', 'name', 'q' ); } ";
	SearchBox_yahoo = "let searchbox = function(  ) { return document.getElementById('yschsp');}";
	SearchBox_bing= "let searchbox = function(  ) {return document.getElementById('sb_form_q'); } ";
	SearchBox_aol= "let searchbox = function(  ) {return document.getElementById('csbquery1');  }";
	SearchBox_baidu= "let searchbox = function(  ) {return document.getElementById('kw');}";

  let suggest_google =  ['gsr' , 'td', function ( elt ) {
    return (elt.hasAttribute('class') && elt.getAttribute('class') == 'gac_c' );
  }];

	let suggest_yahoo = ['atgl' , 'a', function ( elt ) {
    return elt.hasAttribute('gossiptext');
  }];

  let suggest_bing = ['sa_drw' , 'li', function ( elt ) {
    return (elt.hasAttribute('class') && elt.getAttribute('class') == 'sa_sg' );
  }];

	let suggest_baidu = ['st' , 'tr', function ( elt ) {
    return (elt.hasAttribute('class') && elt.getAttribute('class') == 'ml' );
  }];

	let suggest_aol = ['ACC' , 'a', function ( elt ) {
    return (elt.hasAttribute('class') && elt.getAttribute('class') == 'acs');
  }];

  let engines = [
		{'id':'google','name':'Google Search', 'urlmap':"https://www.google.com/search?hl=en&q=|", 'regexmap':"^(https?:\/\/[a-z]+\.google\.(co\\.|com\\.)?[a-z]{2,3}\/(search){1}[\?]?.*?[&\?]{1}q=)([^&]*)(.*)$", "host":"(www\.google\.(co\.|com\.)?[a-z]{2,3})$","testad":"let testad = function(ac,al) {return ( al&& (ac=='l'  || ac=='l vst')&& al.indexOf('http')==0 && al.indexOf('https')!=0);}",'box':SearchBox_google,'button':getButton_google} ,
		{'id':'yahoo','name':'Yahoo! Search', 'urlmap':"http://search.yahoo.com/search;_ylt=" +getYahooId()+"?ei=UTF-8&fr=sfp&fr2=sfp&p=|&fspl=1", 'regexmap':"^(http:\/\/[a-z.]*?search\.yahoo\.com\/search.*?p=)([^&]*)(.*)$", "host":"([a-z.]*?search\.yahoo\.com)$","testad":"let testad = function(ac,al) {return ( ac=='\"yschttl spt\"' || ac=='yschttl spt');}",'box':SearchBox_yahoo,'button':getButton_yahoo},
		{'id':'bing','name':'Bing Search', 'urlmap':"http://www.bing.com/search?q=|", 'regexmap':"^(http:\/\/www\.bing\.com\/search\?[^&]*q=)([^&]*)(.*)$", "host":"(www\.bing\.com)$","testad":"let testad = function(ac,al) {return ( al&& al.indexOf('http')==0&& al.indexOf('https')!=0 && al.indexOf('msn')<0 && al.indexOf('live')<0  && al.indexOf('bing')<0&& al.indexOf('microsoft')<0 && al.indexOf('WindowsLiveTranslator')<0 )    }",'box':SearchBox_bing,'button':getButton_bing},
		{'id':'baidu','name':'Baidu Search', 'urlmap':"http://www.baidu.com/s?wd=|", 'regexmap':"^(http:\/\/www\.baidu\.com\/s\?.*?wd=)([^&]*)(.*)$", "host":"(www\.baidu\.com)$","testad":"let testad = function(ac,al) {return ( al&& al.indexOf('baidu')<0 && al.indexOf('https')!=0  );}",'box':SearchBox_baidu,'button':getButton_baidu},
		{'id':'aol','name':'Aol Search', 'urlmap':"http://search.aol.com/aol/search?q=|", 'regexmap':"^(http:\/\/[a-z0-9.]*?search\.aol\.com\/aol\/search\?.*?q=)([^&]*)(.*)$", "host":"([a-z0-9.]*?search\.aol\.com)$","testad":"let testad = function(ac,al){return(ac=='\"find\"'||ac=='find'&& al.indexOf('https')!=0 && al.indexOf('aol')<0 );}",'box':SearchBox_aol,'button':getButton_aol}
	];

  function getEngIndexById( id) {
	  for (let i=0; i< engines.length; i++) {
			if (engines[i].id == id)
        return i;
		}
		return -1;
	}

	function getEngineById( id) {
		return engines.filter(
      function(a) {
        return a.id === id;
      }
    )[0];
	}

	function updateEngineList() {
		browser.storage.local.set({engines : JSON.stringify(engines)}) ;
		sendMessageToOptionScript("TMNSendEngines",engines);
		sendOptionToTab();
	}

	function sendMessageToOptionScript(title, message) {
		browser.runtime.sendMessage({"options":title,"param":message});
	}

	function handleMessageFromOptionScript(title, handler) {
		 worker_opt.port.on(title,handler);
	}

	function sendMessageToPanelScript(title, message) {
		 browser.runtime.sendMessage(title,message);
	}

	function handleMessageFromPanelScript(title, handler) {
		 tmn_panel.port.on(title,handler);
	}

  function sendOptionParameters() {
    debug("Sending perameters");
    let panel_inputs = {
      "options": getOptions(),
      "query" : tmn_query,
      "engine": prev_engine
    };
    sendMessageToPanelScript("TMNSendOption",panel_inputs);
    tmn_panel.port.on("TMNOpenOption",openOptionWindow);
    tmn_panel.port.on("TMNSaveOptions",saveOptionFromTab);
  }

  function openOptionWindow() {
    tabs.open({
      url: data.url("options.html"),
      onReady:  runScript
    });
  }

  function runScript(tab) {
    worker_opt = tab.attach({
      contentScriptFile: [data.url("jquery.js"),data.url("option-script.js")]
    });
    sendOptionToTab();
  }

  function sendOptionToTab() {
    let tab_inputs = {
      "options":getOptions()
    };
		sendMessageToOptionScript("TMNSendEngines",engines);
    sendMessageToOptionScript("TMNSetOptionsMenu",tab_inputs);
  }

  function clearLog() {
    tmnLogs = [];
    browser.storage.local.set({
      "logs_tmn":"{}"
    });
  }

  function saveOptionFromTab(options) {
    if( enabled !== options.enabled) {
      if (options.enabled)
      {
        restartTMN();
      } else {
        stopTMN();
      }
    }
    debug("useTab: " + options.useTab);
    tmn_timeout = options.timeout;
    searchEngines = options.searchEngines;
    burstEnabled = options.burstMode;
    disableLogs = options.disableLogs;
    saveLogs = options.saveLogs;
    useBlackList = options.use_black_list;
    if ( useDHSList!= options.use_dhs_list) {
      if ( options.use_dhs_list ) {
        readDHSList();
        typeoffeeds.push('dhs');
      } else {
        typeoffeeds.splice(typeoffeeds.indexOf('dhs'),1);
        TMNQueries.dhs = null;
      }
      useDHSList = options.use_dhs_list;
    }

    kwBlackList = options.kw_black_list.split(',');
    debug("Searched engines: "+ searchEngines);
    changeTabStatus(options.useTab);
    saveOptions();
  }

  function changeTabStatus(useT) {
    if ( useT == useTab) return;
    if ( useT ) {
      useTab  = useT;
      createTab() ;
    } else {
      useTab  = useT;
      deleteTab();
    }
  }

  function iniTab(tab) {
    tmn_tab_id = tab.id;
    tmn_win_id = tab.windowId;
    browser.storage.local.set({"tmn_tab_id": tmn_tab_id});
  }

  function getTMNTab() {
    debug("Trying to access to the tab: " + tmn_tab_id);
    return tmn_tab_id;
  }

  function deleteTab() {
    browser.tabs.remove(tmn_tab_id);
    tmn_tab_id = -1;
  }

  function createTab() {
    if (!useTab || tmn_tab_id != -1) return;
    if(debug) console.log ('Creating tab for TrackMeNot');
    try {
      browser.tabs.create({
        'active': false,
        'url': 'http://www.google.com'
      },iniTab);
      return 1;
    } catch (ex) {
      cerr('Can not create TMN tab:' , ex);
      return null;
    }
  }

 	function addEngine(param) {
		let name = param.name;
		let urlmap = param.urlmap;
		let new_engine = {};
		new_engine.name = name;
		new_engine.id = name.toLowerCase();
		let map = urlmap.replace('trackmenot','|');
		new_engine.urlmap = map;
		let query_params = map.split('|');
		let kw_param = query_params[0].split('?')[1].split('&').pop();
		new_engine.regexmap = '^('+ map.replace(/\//g,"\\/").replace(/\./g,"\\.").split('?')[0] + "\\?.*?[&\\?]{1}" +kw_param+")([^&]*)(.*)$";
		engines.push(new_engine);
		debug("Added engine : "+ new_engine.name + " url map is " + new_engine.urlmap );
		updateEngineList();
	}

	function delEngine(param) {
		let del_engine = param.engine;
		let index = getEngIndexById(del_engine);
		searchEngines = searchEngines.split(',').filter(
      function(a) {
        return a !== del_engine;
      }
    ).join(',');
		engines.splice(index,1);
		saveOptions();
		updateEngineList();
	}

  function getYahooId() {
    let id = "A0geu";
    while (id.length < 24) {
      let lower = Math.random() < 0.5;
      let num = parseInt(Math.random() * 38);
      if (num == 37){
        id += '_';
        continue;
      }
      if (num == 36){
        id += '.';
        continue;
      }
      if (num < 10){
        id += String.fromCharCode(num + 48);
        continue;
      }
      num += lower ?  87 : 55;
      id += String.fromCharCode(num);
    }
    return id;
  }

  function trim(s)  {
    if (s !== null) {
      return s.replace(/\n/g,'');
    }
    return s;
  }

  function cerr(msg, e){
    let txt = "[ERROR] "+msg;
    if (e){
      txt += "\n" + e;
      if (e.message)txt+=" | "+e.message;
    } else txt += " / No Exception";
    console.log (txt);
  }

  function debug (msg) {
    if (debug_)
      console.log("DEBUG: " +msg);
  }

  function roll(min,max){
    return Math.floor(Math.random()*(max+1))+min;
  }

  function monitorBurst() {
    browser.webNavigation.onCommitted.addListener(function(e) {
  		let url = e.url;
	  	let tab_id = e.tabId;
		  let result = checkForSearchUrl(url);
  		if (!result) {
        if ( tab_id == tmn_tab_id) {
          debug("TMN tab tryign to visit: "+ url);
        }
        return;
      }

  		// -- EXTRACT DATA FROM THE URL
	  	let pre   = result[1];
		  let query = result[2];
  		let post  = result[3];
	  	let eng   = result[4];
		  let asearch  = pre+'|'+post;
  		if (tmn_tab_id == -1 || tab_id != tmn_tab_id ) {
	  		debug("Worker find a match for url: "+ url + " on engine "+ eng +"!");
		  	if (burstEnabled) {
          enterBurst ( eng );
        }
  	  	let updated_SE = getEngineById(eng);
  			if ( updated_SE && updated_SE.urlmap != asearch ) {
          updated_SE.urlmap = asearch;
          browser.storage.local.set({engines :JSON.stringify(engines)}) ;
          let logEntry = createLog('URLmap', eng, null,null,null, asearch);
          log(logEntry);
          debug("Updated url fr search engine "+ eng + ", new url is "+asearch);
        }
      }
    });
  }

  function checkForSearchUrl(url) {
    let result = null;
    let id = null;
    for (let i=0;i< engines.length; i++){
			let eng = engines[i];
      let regex = eng.regexmap;
      result = url.match(regex);

      if (result)  {
        console.log (regex + " MATCHED! on "+eng.id );
        id = eng.id;
        break;
      }
    }
    if (!result)
      return null;

    if (result.length !== 4 ){
      if (result.length === 6 && id == "google"  ) {
        result.splice(2,2);
        result.push(id);
        return result;
      }
      console.log ("REGEX_ERROR: "+url);
    }
    result.push(id);
    return result;
  }

  function isBursting(){
    return burstEnabled && burstCount>0;
  }

  function chooseEngine( engines)  {
    return engines[Math.floor(Math.random()*engines.length)];
  }

  /**
   * The function that constructs a random search query.
   * Used in doSearch, also see getSubQuery()
   */
  function randomQuery()  {
    let randomElt = function (arr) {
      let index = roll(0, arr.length - 1);
      return arr[index];
    };

    let qtype = randomElt(typeoffeeds);
    debug (qtype);
    let queries = TMNQueries[qtype];
    if ( qtype != 'zeitgeist' && qtype != 'extracted') {
      queries = randomElt(queries);
      if (queries !== undefined && queries.words !== undefined) {
        queries = queries.words;
      } else {
        // no real result to return, try again
        return randomQuery();
      }
    }
    let term = trim( randomElt(queries) );
    if (!term || term.length<1) {
      throw new Error("getQuery.term='"+term+"'");
    }
    return term;
  }

  function validateFeeds(param) {
    TMNQueries.rss = [];
    feedList = param.feeds;
    console.log ("Validating the feeds: "+ feedList);
    let feeds = feedList.split('|');
    for (let i=0;i<feeds.length;i++) {
      console.log (" Fetching  " + feeds[i]);
      doRssFetch(feeds[i]);
    }
    saveOptions();
  }

  function extractQueries(html)    {
    let forbiddenChar = new RegExp("^[ @#<>\"\\\/,;'{}:?%|\^~`=]", "g");
    let splitRegExp = new RegExp('^[\\[\\]\\(\\)\\"\']', "g");

    if (!html) {
      console.log ("NO HTML!");
      return;
    }

    let phrases = [];

    // Parse the HTML into phrases
    let l = html.split(/((<\?tr>)|(<br>)|(<\/?p>))/i);
    for (let i = 0;i < l.length; i++) {
      if( !l[i] || l[i] == "undefined") continue;
      l[i] = l[i].replace(/(<([^>]+)>)/ig," ");
      //if (/([a-z]+ [a-z]+)/i.test(l[i])) {
      //let reg = /([a-z]{4,} [a-z]{4,} [a-z]{4,} ([a-z]{4,} ?) {0,3})/i;
      let matches = l[i].split(" ");//reg.exec(l[i]);
      if (!matches || matches.length<2)
        continue;
      let newQuery = trim(matches[1]);
      // if ( phrases.length >0 ) newQuery.unshift(" ");
      if( newQuery && phrases.indexOf(newQuery)<0 )
        phrases.push(newQuery);
    }
    let queryToAdd = phrases.join(" ");
    TMNQueries.extracted = [].concat(TMNQueries.extracted);
    while (TMNQueries.extracted.length > 200 ) {
      let rand = roll(0,TMNQueries.extracted.length-1);
      TMNQueries.extracted.splice(rand , 1);
    }
    debug (TMNQueries.extracted);
    addQuery(queryToAdd,TMNQueries.extracted);
  }

  function isBlackList( term ) {
    if ( !useBlackList )
      return false;
    let words = term.split(/\W/g);
    for ( let i=0; i< words.length; i++) {
      if ( kwBlackList.indexOf(words[i].toLowerCase()) >= 0)
        return true;
    }
    return false;
  }

  function queryOk(a)    {
    for ( i = 0;i < skipex.length; i++) {
      if (skipex[i].test(a))
        return false;
    }
    return true;
  }

  function addQuery(term, queryList) {
    let noniso = new RegExp("[^a-zA-Z0-9_.\ \\u00C0-\\u00FF+]+","g");

    term = term.replace(noniso,'');
    term = trim(term);

    if ( isBlackList(term) )
      return false;

    if (
      !term ||
      (term.length<3) ||
      (queryList.indexOf(term) > 0)
    )
      return false;

    if (
      term.indexOf("\"\"") > -1 ||
      term.indexOf("--") > -1
    )
      return false;

    // test for negation of a single term (eg '-prison')
    if (
      term.indexOf("-") === 0 &&
      term.indexOf(" ") < 0
    )
      return false;

    if (!queryOk(term))
      return false;

    queryList.push(term);
    //gtmn.console.log ("adding("+gtmn._queries.length+"): "+term);

    return true;
  }

  // returns # of keywords added
  function filterKeyWords(rssTitles, feedUrl) {
    let addStr = ""; //tmp-debugging
    let forbiddenChar = new RegExp("[ @#<>\"\\\/,;'{}:?%|\^~`=]+", "g");
    let splitRegExp = new RegExp('[\\[\\]\\(\\)\\"\']+', "g");
    let wordArray = rssTitles.split(forbiddenChar);

    for (let i=0; i < wordArray.length; i++)  {
      if ( !wordArray[i].match('-----') ) {
        let word = wordArray[i].split(splitRegExp)[0];
        if (word && word.length>2) {
          W: while (
            i < (wordArray.length) &&
            wordArray[i+1] &&
            !(wordArray[i+1].match('-----') ||
            wordArray[i+1].match(splitRegExp))
          ) {
            let nextWord = wordArray[i+1];   // added new check here -dch
            if ( nextWord != nextWord.toLowerCase())  {
              nextWord=trim(nextWord.toLowerCase().replace(/\s/g,'').replace(/[(<>"'&]/g,''));
              if (nextWord.length>1)  {
                    word += ' '+nextWord;
              }
            }
            i++;
          }
          word = word.replace(/-----/g,'');
          addStr += word+", "; //tmp
        }
      }
    }
    return addStr;
  }

  // returns # of keywords added
  function addRssTitles(xmlData, feedUrl) {
    let rssTitles = "";

    if (!xmlData) return 0;  // only for asynchs? -dch

    let feedTitles = xmlData.getElementsByTagName("title");
    if (!feedTitles|| feedTitles.length<2)  {
      cerr("no items("+feedTitles+") for rss-feed: "+feedUrl);
      return 0;
    }
    let feedObject = {};
    feedObject.name = feedTitles[0].firstChild.nodeValue;
    feedObject.words = [];
    //console.log ('ADD RSS title : '+ feedTitles[0].firstChild.nodeValue);
    for (let i=1; i<feedTitles.length; i++){
      if ( feedTitles[i].firstChild ) {
        rssTitles = feedTitles[i].firstChild.nodeValue;
        rssTitles += " ----- ";
      }
      let queryToAdd = filterKeyWords(rssTitles,  feedUrl);
      addQuery(queryToAdd,feedObject.words);
    }
    //console.log (feedObject.name + " : " + feedObject.words)

    if (useRss) {
      TMNQueries.rss.push(feedObject);
    }

    return 1;
  }

  function  readDHSList() {
    TMNQueries.dhs = [];
    let i = 0;
    let req =  new XMLHttpRequest();
    req.overrideMimeType("application/json");
    req.open('GET',browser.extension.getURL("dhs_keywords.json"),true);
    req.onreadystatechange = function () {
      let response = JSON.parse(req.responseText);
      let keywords = response.keywords;
      for (let cat of keywords)   {
        TMNQueries.dhs[i] = {};
        TMNQueries.dhs[i].category_name = cat.category_name;
        TMNQueries.dhs[i].words = [];
        for  (let word of cat.category_words)
        {
          TMNQueries.dhs[i].words.push(word.name);
        }
        i++;
      }
    };
    req.send(null);
  }

  function doRssFetch(feedUrl){
    try {
      req = new XMLHttpRequest();
      req.open('GET', feedUrl, true);
      req.onreadystatechange = function(){
        if (req.readyState == 4) {
          if (req.status == 200) {
            debug (req.responseText);
            let adds = addRssTitles(req.responseXML, feedUrl);
          }
        }
      };
      req.send(null);
    } catch (ex) {
      console.log (
        "[WARN]  doRssFetch("+
        feedUrl+
        ")\n"+
        "  "+
        ex.message+
        " | Using defaults..."
      );
      return ; // no adds here...
    }
  }

  function getSubQuery(queryWords) {
    let incQuery = "";
    let randomArray = [];
    for (let k = 0; k < queryWords.length ; k++) {
      randomIndex = roll(0,queryWords.length-1);
      if ( randomArray.indexOf(randomIndex) < 0)
        randomArray.push(randomIndex);
    }
    randomArray.sort();
    for ( k = 0; k < randomArray.length-1 && k < 5; k++) {
      incQuery += queryWords[randomArray[k]]+' ';
    }
    incQuery += queryWords[randomArray[k]];
    if (incQueries)
      incQueries.push(trim(incQuery));
  }

  function getQuery() {
    let term = randomQuery();
    if (term.indexOf('\n') > 0) { // yuck, replace w' chomp();
      while (true) {
        for (let i = 0;i < term.length; i++) {
          if (term.charAt(i)=='\n') {
            term = term.substring(0,i)+' '+term.substring(i+1,term.length);
            continue;
          }
        }
        break;
      }
    }
    return term;
  }

  function updateOnErr() {
    let details = {
      'text':'Error'
    };
    let tooltip = {
      'title': 'TMN Error'
    };
    browser.browserAction.setBadgeBackgroundColor({
      'color':[255,0,0,255]
    });
    browser.browserAction.setBadgeText(details);
    browser.browserAction.setTitle(tooltip);
  }

  function updateOnSend ( queryToSend ) {
    tmn_query = queryToSend;
    let details = {
      'text':queryToSend
    };
    let tooltip = {
      'title': engine+': '+queryToSend
    };
    browser.browserAction.setBadgeBackgroundColor({
      'color':[113,113,198,255]
    });
    browser.browserAction.setBadgeText(details);
    browser.browserAction.setTitle(tooltip);
  }

  function createLog(type,engine,mode,query,id,asearch) {
    let logEntry = {  'type' : type, "engine" : engine };
    if (mode)
      logEntry.mode = tmn_mode;
    if (query)
      logEntry.query = query;
    if (id)
      logEntry.id = id;
    if (asearch)
      logEntry.newUrl =  asearch;
    return logEntry;
  }

  function doSearch(){
    let newquery = getQuery();
    try {
      if (incQueries && incQueries.length > 0)
        sendQuery(null);
      else {
        newquery = getQuery();
        queryWords = newquery.split(' ');
        if (queryWords.length > 3 )   {
          getSubQuery(queryWords);
          if (useIncrementals)   {
            let unsatisfiedNumber = roll(1,4);
            for (let n = 0; n < unsatisfiedNumber-1; n++)
              getSubQuery(queryWords);
          }
          // not sure what is going on here? -dch
          if (incQueries && incQueries.length > 0)
            newquery = incQueries.pop();
        }
        sendQuery(newquery);
      }
    } catch (e) {
      cerr("error in doSearch",e);
    }
  }

  function sendQuery(queryToSend)  {
    tmn_scheduledSearch = false;
    let url =  getEngineById(engine).urlmap;
    let isIncr = (queryToSend === null);
    if (queryToSend === null){
      if (incQueries && incQueries.length > 0)
        queryToSend = incQueries.pop();
      else  {
        if (!queryToSend)
          console.log ('sendQuery error! queryToSendis null');
        return;
      }
    }
    if (Math.random() < 0.9) queryToSend = queryToSend.toLowerCase();
    if (queryToSend[0]==' ' ) queryToSend = queryToSend.substr(1); //remove the first space ;

    if ( useTab ) {
      if ( getTMNTab() === -1 ) {
        createTab();
      }
      let TMNReq = {
        tmnQuery: queryToSend,
        tmnEngine: getEngineById(engine),
        allEngines: engines,
        tmnUrlMap: url,
        tmnMode: tmn_mode,
        tmnID : tmn_id++
      };
      try {
        browser.tabs.sendMessage( tmn_tab_id, TMNReq);
        debug('Message sent to the tab');
      } catch(ex) {
        rescheduleOnError();
      }
    } else {
      let queryURL = queryToURL(url ,queryToSend);
      debug ("The encoded URL is " + queryURL);
      let xhr = new XMLHttpRequest();
      xhr.open("GET", queryURL, true);
      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
          clearTimeout(tmn_errTimeout);
          if (xhr.status >= 200 && xhr.status < 400 ) {
            let logEntry = {
              type : 'query',
              engine : engine,
              mode : tmn_mode,
              query : queryToSend,
              id : tmn_id++
            };
            log(logEntry);
            reschedule();
            let html = xhr.responseText;
            extractQueries(html);
          } else {
            rescheduleOnError();
          }
        }
      };
      updateOnSend(queryToSend);
      xhr.send();
      currentTMNURL = queryURL;

    }
  }

  function queryToURL ( url, query) {
    if (Math.random() < 0.9)
      query = query.toLowerCase();
    let urlQuery = url.replace('|',query);
    urlQuery = urlQuery.replace(/ /g,'+');
    let encodedUrl = encodeURI(urlQuery);
    encodedUrl = encodedUrl.replace(/%253/g,"%3");

    return encodedUrl;
  }

  function updateCurrentURL(taburl) {
    currentTMNURL = taburl.url;
    debug("currentTMNURL is :"+currentTMNURL);
  }

  function rescheduleOnError () {
    let pauseAfterError = Math.max(2*tmn_timeout, 60000);
    tmn_mode = 'recovery';
    burstCount=0;
    console.log ("[INFO] Trying again in "+(pauseAfterError/1000)+ "s");
    log({
      'type' : 'ERROR' ,
      'message': 'next search in '+(pauseAfterError/1000)+ "s",
      'engine':engine
    });
    updateOnErr();

    // reschedule after long pause
    if (enabled )
      scheduleNextSearch(pauseAfterError);
    return false;
  }

  function reschedule() {
    let delay =  tmn_timeout;

    if(tmn_scheduledSearch) return;
    else tmn_scheduledSearch = true;

    if (isBursting())  { // schedule for burs
      delay = Math.min(delay,burstTimeout);
      scheduleNextSearch(delay);
      tmn_mode = 'burst';
      burstCount--;
    } else  { // Not bursting, schedule per usual
      tmn_mode = 'timed';
      scheduleNextSearch(delay);
    }
  }

  function scheduleNextSearch(delay) {
    if (!enabled) return;
    if (delay > 0) {
      if (!isBursting()) { // randomize to approach target frequency
        let offset = delay*(Math.random()/2);
        delay = parseInt(delay) + offset;
      } else  { // just simple randomize during a burst
        delay += delay*(Math.random() - 0.5);
      }
    }
    if (isBursting()) engine = burstEngine;
    else engine = chooseEngine(searchEngines.split(','));
    debug('NextSearchScheduled on: '+engine);
    tmn_errTimeout = window.setTimeout(rescheduleOnError, delay*3);
    tmn_searchTimer = window.setTimeout(doSearch, delay);
  }

  function enterBurst ( burst_engine ) {
    if (!burstEnabled)
      return;
    console.log ("Entering burst mode for engine: " + burst_engine);
      let logMessage = {
        type:'info',
        message:'User made a search, start burst',
        engine:burst_engine
      };
    log(logMessage);
    burstEngine = burst_engine;
    burstCount = roll(3,10);
  }

  function deleteTabWithUrl(tabURL) {
    for  (let tab of tabs)
      if (tab.url == tabURL) {
        tab.close();
        return;
      }
  }

  function saveOptions() {
    let options = getOptions();
    browser.storage.local.set({
      "options_tmn": JSON.stringify(options),
      "tmn_id": tmn_id,
      "gen_queries": JSON.stringify(TMNQueries)
    });
  }

  function getOptions() {
    let options = {};
    options.enabled = enabled;
    options.timeout = tmn_timeout;
    options.searchEngines = searchEngines;
    options.useTab = useTab;
    options.burstMode = burstEnabled;
    options.feedList = feedList;
    options.use_black_list = useBlackList;
    options.use_dhs_list = useDHSList;
    options.kw_black_list = kwBlackList.join(",");
    options.saveLogs= saveLogs;
    options.disableLogs = disableLogs;
    options.useRss = useRss;
    options.useUserList = useUserList;
    return options;
  }

  function initOptions() {
    enabled = true;
    timeout = 6000;
    burstMode = true;
    searchEngines = "google,yahoo,bing";
    useTab = false;
    useBlackList = true;
    useDHSList = false;
    useRss = true;
    kwBlackList= ['bomb', 'porn', 'pornographie'];
    saveLogs =  true;
    disableLogs  = false;
  }

  function restoreOptions () {
    if (
        !browser.storage.local.get("options_tmn")
    ) {
      initOptions();
      console.log ("Init: "+ enabled);
      return;
    }

    try {
      let options = JSON.parse(browser.storage.local.get("options_tmn"));
      enabled = options.enabled;
      debug("Restore: "+ enabled);
      useBlackList = options.use_black_list;
      useDHSList = options.use_dhs_list;
      tmn_timeout = options.timeout;
      burstEnabled = options.burstMode;
      searchEngines = options.searchEngines;
      disableLogs = options.disableLogs;
      saveLogs =  options.saveLogs;
      useTab  = options.useTab;
      feedList = options.feedList;
      tmn_id = options.tmn_id;
      useRss = options.useRss;
      useUserList = options.useUserList;
      if (browser.storage.local.get("gen_queries") != "") {
        TMNQueries = JSON.parse(browser.storage.local.get("gen_queries"));
      }
      if (browser.storage.local.get("logs_tmn") != "") {
        tmnLogs =  JSON.parse( browser.storage.local.get("logs_tmn") );
      }
      if (browser.storage.local.get("engines") != "") {
        engines = JSON.parse( browser.storage.local.get("engines") );
      }
      if (options.kw_black_list && options.kw_black_list.length > 0) {
        kwBlackList = options.kw_black_list.split(",");
      }
    } catch (ex) {
      console.trace(ex);
      console.log ('No option recorded: '+ex);
    }
  }

  function toggleTMN() {
    enabled = !enabled;
    return enabled;
  }

  function restartTMN() {
    createTab();
    enabled = true;
    browser.browserAction.setBadgeText({'text':'On'});
    browser.browserAction.setTitle({'title':'On'});
    scheduleNextSearch(4000);
  }

  function stopTMN() {
    enabled = false;
    if (useTab)
      deleteTab();

    browser.browserAction.setBadgeBackgroundColor({
      'color':[255,0,0,255]
    });
    browser.browserAction.setBadgeText({'text':'Off'});
    browser.browserAction.setTitle({'title':'Off'});
    window.clearTimeout(tmn_searchTimer);
    window.clearTimeout(tmn_errTimeout);
  }

  function preserveTMNTab() {
    if ( useTab && enabled) {
      tmn_tab = null;
      console.log ('TMN tab has been deleted by the user, reload it');
      createTab();
    }
  }
  function formatNum ( val) {
    if (val < 10) return '0'+val;
    return val;
  }

  function log (entry) {
    if (disableLogs)
      return;
    try  {
      if (entry !== null)  {
        if (entry.type === 'query') {
          if( entry.id && entry.id === tmn_logged_id)
            return;
          tmn_logged_id = entry.id;
        }
        let now = new Date();
        entry.date = formatNum(now.getHours())+":"+ formatNum(now.getMinutes())+":"+ formatNum(now.getSeconds())+
          '   '+(now.getMonth()+1) + '/' + now.getDate()+ '/' + now.getFullYear() ;
      }
    }
    catch(ex){
      console.log ("[ERROR] "+ ex +" / "+ ex.message +  "\nlogging msg");
    }
    tmnLogs.unshift(entry);
    browser.storage.local.set({
      "logs_tmn": JSON.stringify(tmnLogs)
    });
  }

  function sendClickEvent() {
    if ( prev_engine  ) {
      console.log ("About to click on " + prev_engine);
      browser.tabs.sendMessage(tmn_tab_id,{tmn_engine:getEngineById(prev_engine)});
    }
  }

  function handleRequest(request, sender, sendResponse) {
    if (request.tmnLog) {
      console.log ("Background logging : " + request.tmnLog);
      let logtext = JSON.parse(request.tmnLog);
      log(logtext);
      sendResponse({});
      return;
    }
    if (request.updateStatus) {
      updateOnSend(request.updateStatus);
      sendResponse({});
      return;
    }
    /*if (request.userSearch) {
      console.log ("Detected User search")
      enterBurst(request.userSearch);
      sendResponse({});
      return;
      }*/
    if ( request.getURLMap) {
      let tmp_engine = request.getURLMap;
      let urlMap = currentUrlMap[tmp_engine];
      sendResponse({
        "url": urlMap
      });
      return;
    }
    if ( request.setURLMap) {
      console.log ("Background handling : " + request.setURLMap);
      let vars = request.setURLMap.split('--');
      let eng = vars[0];
      let asearch = vars[1];
      currentUrlMap[eng] = asearch;
      browser.storage.local.set({
        "url_map_tmn": JSON.stringify(currentUrlMap)
      });
      let logEntry = {
        'type' : 'URLmap',
        "engine" : eng,
        'newUrl' : asearch
      };
      log(logEntry);
      sendResponse({});
      return;
    }
    //console.log ("Background page received message: " + request.tmn);
    switch (request.tmn) {
      case "currentURL":
        sendResponse({
          "url": currentTMNURL
        });
        break;
      case "useTab" :
        sendResponse({
          "tmnUseTab": useTab
        });
        break;
      case "pageLoaded": //Remove timer and then reschedule;
        if (last_url == request.url) break;
        else last_url = request.url;
        prev_engine = engine;
        clearTimeout(tmn_errTimeout);
        if (Math.random() < 1) {
          sendClickEvent();
        }
        reschedule();
        try {
          let html = request.html;
          extractQueries(html);
        } catch (ex) {}
        sendResponse({});
        break;
      case "tmnError": //Remove timer and then reschedule;
        clearTimeout(tmn_errTimeout);
        rescheduleOnError();
        sendResponse({});
        break;
      case "isActiveTab":
        let active = (!sender.tab || sender.tab.id==tmn_tab_id);
        console.log ("active: "+ active);
          sendResponse(
            {"isActive": active}
          );
        break;
      case "TMNSaveOptions":
        saveOptionFromTab(request.option);
        sendResponse({});
        break;
      case "TMNResetOptions":
        resetOptions();
        sendResponse({});
        break;
      case "TMNValideFeeds":
        validateFeeds(request.param);
        sendResponse({});
        break;
      case "TMNAddEngine":
        alert(request.engine);
        addEngine(request.engine);
        sendResponse({});
        break;
      case "TMNDelEngine":
        delEngine(request.engine);
        sendResponse({});
        break;
      default:
        // snub them.
    }

  }

  return {

    _handleRequest :  function(request, sender, sendResponse) {
      handleRequest(request, sender, sendResponse);
    },

    startTMN : function () {
      restoreOptions();
      //browser.browserAction.setPopup("tmn_menu.html");
      typeoffeeds.push('zeitgeist');
      TMNQueries.zeitgeist = zeitgeist;

      if (TMNQueries.extracted && TMNQueries.extracted.length >0) {
        typeoffeeds.push('extracted');
      }

      if (!load_full_pages) {
        stop_when = "start";
      } else {
        stop_when = "end";
      }

      if (useRss) {
        typeoffeeds.push('rss');
        TMNQueries.rss = [];

        let feeds = feedList.split('|');
        for (let i=0;i<feeds.length;i++)
          doRssFetch(feeds[i]);
      }

      if (useUserList) {
        // populate userlist from the file — synchronous request
        var xhr = new XMLHttpRequest();
        xhr.open("GET", browser.extension.getURL("tmn_wordlist.txt"), false);
        xhr.onreadystatechange = function() {
          if (xhr.readyState == 4) {
            clearTimeout(tmn_errTimeout);
            if (xhr.status >= 200 && xhr.status < 400 ) {
              typeoffeeds.push('userlist');
              let list = xhr.responseText;
              TMNQueries.userlist = list.split("\n");
            } else {
            }
          }
        };
      }

      if ( useDHSList ) {
        readDHSList();
        typeoffeeds.push('dhs');
      }

      let engines = searchEngines.split(',');
      engine = chooseEngine(engines);
      monitorBurst();

      if (enabled) {

        browser.browserAction.setBadgeText({
          'text':'ON'
        });
        browser.browserAction.setTitle({
          'title': 'TMN is ON'
        });

        createTab();
        scheduleNextSearch(4000);
      } else {
        browser.browserAction.setBadgeText({
          'text':'OFF'
        });
        browser.browserAction.setTitle({
          'title': 'TMN is OFF'
        });
      }

      browser.windows.onRemoved.addListener(function() {
        if (useTab) {
          deleteTab();
        }
        if (!saveLogs)
          browser.storage.local.set({"logs_tmn" : ""});
      });

    },

    _getOptions:function() {
      return getOptions();
    },

    _getLogs : function() {
      return tmnLogs;
    },

    _clearLogs : function() {
      clearLog();
    },

    _getAllQueries : function() {
      return TMNQueries;
      //sendMessageToOptionScript("TMNSendQueries",{queries:allqueries})
    },

    _restartTMN:function() {
      return restartTMN();
    },

    _stopTMN:function() {
      return stopTMN();
    },

    _getEngine:function() {
      return engine;
    },

    _getTargetEngines:function() {
      return engines;
    },

    _getQuery:function() {
      return this.queryToSend;
    },

    _saveOptions: function() {
      return saveOptions();
    },

    _changeTabStatus: function(useT) {
      return changeTabStatus(useT);
    },

    _hideTMNTab : function(tab_id) {
      if (tab_id == tmn_tab_id ) {
        console.log ('TMN tab has been selected by the user, hidding it');
        browser.tabs.remove( tmn_tab_id );
        return;
      }

    },

    _deleteTabWhenClosing : function(win_id) {
      if (useTabe && tmn_win_id == win_id ) {
        console.log ('TMN win has been closed by the user, close the tab');
        browser.tabs.remove( tmn_tab_id );
        return;
      }

    },

    _preserveTMNTab : function(tab_id) {
      if (tab_id == tmn_tab_id && useTab ) {
        tmn_tab_id = -1;
        console.log ('TMN tab has been deleted by the user, reload it');
        createTab();
        return;
      }

    },
  };
}();

browser.runtime.onMessage.addListener(TRACKMENOT.TMNSearch._handleRequest);

//browser.tabs.onSelectionChanged.addListener(TRACKMENOT.TMNSearch._hideTMNTab);
browser.tabs.onRemoved.addListener(TRACKMENOT.TMNSearch._preserveTMNTab);
//browser.windows.onRemoved.addListener(TRACKMENOT.TMNSearch._deleteTabWhenClosing);

TRACKMENOT.TMNSearch.startTMN();
