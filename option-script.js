let tmn_options ={};
let getting_tmn = browser.runtime.getBackgroundPage();
let tmn;
getting_tmn.then(function(page) {
  tmn = page.TRACKMENOT.TMNSearch;
});
let options = null;

function loadHandlers() {
  $("#apply-options").click( function() {
    tmn_options = {
      "options": saveOptions()
    };
    browser.runtime.sendMessage({
      'tmn':"TMNSaveOptions",
      'option':tmn_options.options
    });
    TMNSetOptionsMenu(tmn_options.options);
    // saving effect
    $("img").fadeTo(100, 0.3, function() {
      $(this).fadeTo(500, 1.0);
    });
  });
  $("#reset-options").click( function() {
    browser.runtime.sendMessage({
      'tmn':"TMNResetOptions"
    });
    window.location.reload();
  });

  $("#show-add").click( function() {
    $("#add-engine-table").show();
  }
  );
  $("#show-log").click( TMNShowLog );

  $("#trackmenot-opt-showqueries").click(  TMNShowQueries);

  $("#validate-feed").click( function() {
    let feeds = $("#trackmenot-seed").val();
    let param = {"feeds": feeds};
    browser.runtime.sendMessage({'tmn':"TMNValideFeeds",'param':param});
  }
  );

  $("#clear-log").click( TMNClearLogs	);

  $("#search-engine-list").on('click', 'button.smallbutton', function(event) {
    let del_engine = event.target.id.split("_").pop();
    browser.runtime.sendMessage({
      'tmn':"TMNDelEngine",
      'engine':del_engine
    });
    setTimeout(function() {
      window.location.reload();
    }, 500);
  });

  $("#help-faq").click( function() {
    window.open('http://cs.nyu.edu/trackmenot/faq.html#options');
  });

  $("#main-site").click( function() {
    window.open('http://cs.nyu.edu/trackmenot');
  });


  $("#add-engine").click( function() {
    let engine = {};
    engine.name = $("#newengine-name").val();
    engine.urlmap = $("#newengine-map").val();
    if(engine.urlmap.indexOf('trackmenot') <0 ) {
      alert("Did not find 'trackmenot' in the URL");
      return;
    }
    browser.runtime.sendMessage({
      'tmn':"TMNAddEngine",
      'engine': engine
    });
    setTimeout(function() {
      window.location.reload();
    }, 500);
  });
}

// Update controls based on saved options
function TMNSetOptionsMenu( options ) {
  let default_options = tmn._getOptions();
  options = $.extend({}, default_options, options);
  let feedList = options.feedList;
  let kw_black_list = options.kw_black_list;
  $("#add-engine-table").hide();
  $("#trackmenot-opt-enabled").prop('checked', options.enabled);
  $("#trackmenot-opt-useTab").prop('checked',options.useTab);
  $("#trackmenot-opt-burstMode").prop('checked',options.burstMode);
  $("#trackmenot-opt-save-logs").prop('checked',options.saveLogs);
  $("#trackmenot-opt-disable-logs").prop('checked',options.disableLogs);
  $("#trackmenot-opt-userss").prop('checked',options.useRss);
  $("#trackmenot-use-userlist").prop('checked',options.useUserList);

  $("#trackmenot-seed").val(feedList);
  $("#trackmenot-blacklist").val(kw_black_list);
  $("#trackmenot-use-blacklist").prop('checked', options.use_black_list);
  $("#trackmenot-use-dhslist").prop('checked', options.use_dhs_list);

  let engines = options.searchEngines.split(',');
  for( let i=0; i < engines.length;i++)
    $("#"+engines[i]).prop('checked',true);

  setFrequencyMenu(options.timeout);
}

function setFrequencyMenu(timeout){
  let menu = $("#trackmenot-opt-timeout");
  $('#trackmenot-opt-timeout option[value=' +timeout+ ']').prop('selected', true);
}

function TMNClearLogs() {
  tmn._clearLogs();
  TMNShowLog();
}

function TMNShowLog() {
  let logs = tmn._getLogs();
  let htmlStr = '<table width=500 cellspacing=3 bgcolor=white  frame=border>';
  htmlStr += '<thead><tr align=left>';
  htmlStr += '<th>Engine</th>';
  htmlStr += '<th>Mode</th>';
  htmlStr += '<th>URL</th>';
  htmlStr += '<th>Query/Message</th>';
  htmlStr += '<th>Date</th>';
  htmlStr += '</tr></thead>';
  for (let i=0; i< 3000 && i<logs.length ; i++) {
    htmlStr += '<tr ';
    if (logs[i].type == 'ERROR') htmlStr += 'style="color:Red">';
    if (logs[i].type == 'query') htmlStr += 'style="color:Black">';
    if (logs[i].type == 'URLmap') htmlStr += 'style="color:Brown">';
    if (logs[i].type == 'click') htmlStr += 'style="color:Blue">';
    if (logs[i].type == 'info') htmlStr += 'style="color:Green">';
    htmlStr += logs[i].engine ? '<td><b>' + logs[i].engine+ '</b></td>'  : '<td></td>';
    htmlStr += logs[i].mode ? '<td>' + logs[i].mode+ '</td>'  : '<td></td>';
    htmlStr += logs[i].newUrl ? '<td>' + logs[i].newUrl.substring(0,50) + '</td>'  : '<td></td>';
    htmlStr += logs[i].query ? '<td>' + logs[i].query+ '</td>'  : '<td></td>';
    htmlStr += logs[i].date ? '<td>' + logs[i].date+ '</td>'  : '<td></td>';

    htmlStr += '</font></tr>';
  }
  htmlStr += '</table>';
  $('#tmn_logs_container').html(htmlStr);
}

function TMNShowEngines(engines) {
  if (!engines) {
    return;
  }
  let htmlStr = "<table>";
  for (let i=0; i < engines.length; i++) {
    let engine = engines[i];
    htmlStr += '<tr >';
    htmlStr += '<td><input type="checkbox"  id="'+ engine.id +'" value="'+engine.id +'">'+ engine.name +'</td><td><button class="smallbutton" id="del_engine_'+engine.id+'" > - </button> </td>';
    htmlStr += '</tr>';
  }
  htmlStr += '</table>';
  $('#search-engine-list').html(htmlStr);
}

function TMNShowQueries() {
  let sources = tmn._getAllQueries();
  let htmlStr =  '<a href="#userlist">Userlist</a> | <a href="#dhs">DHS</a> | <a href="#rss"> RSS </a> | <a href="#popular"> Popular </a>|<a href="#extracted"> Extracted</a>';
  htmlStr += '<div style="height:1000px;overflow:auto;"><table width=500 cellspacing=3 bgcolor=white  frame=border>';
  let default_options = tmn._getOptions();

  if ( sources.userlist ) {
    htmlStr += '<tr style="color:Black"  bgcolor=#D6E0E0 align=center>';
    htmlStr += '<td > User list <td>';
    htmlStr += '<a name="userlist"></a>';
    htmlStr += '</tr>';
    for (let i=0;  i<sources.userlist.length ; i++) {
      htmlStr += '<tr style="color:Black"  bgcolor=#F0F0F0 align=center>';
      htmlStr += '<td>' +sources.userlist[i]+'<td>';
      htmlStr += '</tr>';
    }
  }
  if ( sources.dhs ) {
    htmlStr += '<tr style="color:Black"  bgcolor=#D6E0E0 align=center>';
    htmlStr += '<td > DHS Monitored <td>';
    htmlStr += '<a name="dhs"></a>';
    htmlStr += '</tr>';
    for (let i=0;  i<sources.dhs.length ; i++) {
      htmlStr += '<tr style="color:Black"  bgcolor=#F0F0F0 align=center>';
      htmlStr += '<td>' +sources.dhs[i].category_name+ '<td>';
      htmlStr += '</tr>';
      for (let j=0;  j< sources.dhs[i].words.length ; j++) {
        htmlStr += '<tr style="color:Black">';
        htmlStr += '<td>' +sources.dhs[i].words[j]+ '<td>';
        htmlStr += '</tr>';
      }
    }
  }
  if ( default_options.useRss && sources.rss ) {
    htmlStr += '<tr style="color:Black"  bgcolor=#D6E0E0 align=center>';
    htmlStr += '<td > RSS <td>';
    htmlStr += '<a name="rss"></a>';
    htmlStr += '</tr>';
    for (let i=0;  i < sources.rss.length ; i++) {
      htmlStr += '<tr style="color:Black"  bgcolor=#F0F0F0 align=center>';
      htmlStr += '<td>' +sources.rss[i].name+ '<td>';
      htmlStr += '</tr>';
      for (let j=0;  j< sources.rss[i].words.length ; j++) {
        htmlStr += '<tr style="color:Black">';
        htmlStr += '<td>' +sources.rss[i].words[j]+ '<td>';
        htmlStr += '</tr>';
      }
    }
  }
  if ( sources.zeitgeist ) {
    htmlStr += '<tr style="color:Black"  bgcolor=#D6E0E0 align=center>';
    htmlStr += '<td > Popular <td>';
    htmlStr += '<a name="popular"></a>';
    htmlStr += '</tr>';
    for (let i=0;  i< sources.zeitgeist.length ; i++) {
      htmlStr += '<tr style="color:Black">';
      htmlStr += '<td>' +sources.zeitgeist[i]+ '<td>';
      htmlStr += '</tr>';
    }
  }
  if ( sources.extracted ) {
    htmlStr += '<tr style="color:Black"  bgcolor=#D6E0E0 align=center>';
    htmlStr += '<td > Extracted <td>';
    htmlStr += '<a name="extracted"></a>';
    htmlStr += '</tr>';
    for (let i=0; i<sources.extracted.length ; i++) {
      htmlStr += '<tr style="color:Black"  bgcolor=#F0F0F0 align=center>';
      htmlStr += '<td>' +sources.extracted[i]+ '<td>';
      htmlStr += '</tr>';
    }
  }
  htmlStr += '</table>';
  $('#tmn_logs_container').html(htmlStr);
}

// ES6 function to remove duplicates.
function remove_duplicates_es6(arr) {
  let s = new Set(arr);
  let it = s.values();
  return Array.from(it);
}

// Make an options object and return it. Does not actually save anything.
function saveOptions() {
  let options = {};
  options.enabled =  $("#trackmenot-opt-enabled").is(':checked');

  options.useTab = $("#trackmenot-opt-useTab").is(':checked');
  options.burstMode = $("#trackmenot-opt-burstMode").is(':checked');
  options.disableLogs = $("#trackmenot-opt-disable-logs").is(':checked');
  options.useRss = $("#trackmenot-opt-userss").is(':checked');
  options.useUserList = $("#trackmenot-use-userlist").is(':checked');
  options.saveLogs = $("#trackmenot-opt-save-logs").is(':checked');

  options.timeout = $("#trackmenot-opt-timeout").val();

  let file = $('#trackmenot-userlist').get(0).files[0];
  if (file) {
    let reader = new FileReader();
    let userlist = "";
    reader.onload = function(e) {
      userlist = reader.result;
      let words = userlist.split("\n");
      words = remove_duplicates_es6(words);
      words = words.filter(function(elem, pos) {
        return (elem !== "");
      });
      browser.runtime.sendMessage({
        'tmn':"TMNSaveUserlist",
        'option':words,
      });
    };
    reader.readAsText(file);
  }

  setFrequencyMenu(options.timeout);

  let engines = '';
  let list = $("#search-engine-list:checked");
  $("#search-engine-list :checked").each(
    function(){
      engines += ($(this).val())+",";
    }
  );
  if (engines.length>0)
    engines = engines.substring(0,engines.length-1);

  options.searchEngines = engines;
  options.feedList = $("#trackmenot-seed").val();
  options.use_black_list =  $("#trackmenot-use-blacklist").is(':checked');
  options.use_dhs_list = $("#trackmenot-use-dhslist").is(':checked');
  options.kw_black_list = $("#trackmenot-blacklist").val();
  return options;
}

function handleRequest(request, sender, sendResponse) {
  if (!request.options) return;

  switch (request.options) {
    case "TMNSetOptionsMenu":
      TMNSetOptionsMenu(request.param);
      sendResponse({});
      break;
    case "TMNSendLogs":
      TMNShowLog(request.param);
      sendResponse({});
      break;
    case "TMNSendQueries":
      TMNShowQueries(request.param);
      sendResponse({});
      break;
    case "TMNSendEngines":
      TMNShowEngines(request.param);
      sendResponse({});
      break;
    default:
      sendResponse({}); // snub them.
  }
}

document.addEventListener('DOMContentLoaded', function () {
  if (tmn) {
    TMNShowEngines(tmn._getTargetEngines());
  } else {
    TMNShowEngines();
  }
  TMNSetOptionsMenu();
  loadHandlers();
});

browser.runtime.onMessage.addListener(function(){
  handleRequest();
});
