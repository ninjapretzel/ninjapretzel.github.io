guid = function() {
    function s4() { return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);     }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

clamp = function(val, min, max) {
    if (val < min) { return min; }
    if (val > max) { return max; }
    return val;
}

chars = {};
MAX_NRG_DEFAULT = 30;
maxnrg = MAX_NRG_DEFAULT;
lastSave = -1;
interval = -1;
selectedOnline = "offline"

var FULL_COLOR = "green";
var NORMAL_COLOR = "amber;"

ONLINE_ENERGY_PER_SECOND = 1 / (60 * 3); // one per 3 minutes
OFFLINE_ENERGY_PER_SECOND = 1 / (60 * 30); // one per 30 minutes
DEBUG_ENERGY_PER_SECOND = 3;
$(document).ready(() => {
	var cnt = getCookie("cnt");
    console.log("Loaded " + cnt + " things")
    
	maxnrg = getCookie("maxnrg");
    if (maxnrg) { maxnrg = parseInt(maxnrg); }
    else { maxnrg = MAX_NRG_DEFAULT; }
    $("#maxnrg").val(maxnrg);
    
    var last = getCookie("last");
    
    var bed = getCookie("bed");
    if (bed == "") { bed = "noBed"; }
    $("#" + bed).attr('checked', 'checked');
    
    console.log("Saved at : " + last);
    if (last) { 
        last = parseInt(last); 
        lastSave = last;
    } else {
        lastSave = new Date().getTime();
    }
    
    
    if (cnt != "") {
        for (var i = 0; i < cnt; i++) {
            var name = getCookie("name__"+i);
            var nrg = getCookie("nrg__"+i);
            var uid = getCookie("uid__"+i);
            var online = (getCookie("online__"+i) === "true")
            
            console.log("" + i + " : " + nrg)
            if (nrg && nrg != "") {
                nrg = parseFloat(nrg);
            } else {
                nrg = 0;
            }
            nrg = clamp(nrg, 0, maxnrg);
            
            if (name != "" && nrg != "") {
                insertChar(name, nrg, online, uid, last);
            }


        }
    }
    
    save(true);
    
    $("#maxnrg").change(()=>{
        var v = $("#maxnrg").val();
        if (v) {
            var n = parseInt(v);
            
            maxnrg = (n > MAX_NRG_DEFAULT) ? n : MAX_NRG_DEFAULT;
            $("#maxnrg").val(maxnrg);
            
            console.log('maxnrg changed to ' + maxnrg + " : " + (maxnrg+1))
            
        }
        
        
        $(".nrg").each((i, e)=>{ 
            var input = $(e).find("input");
            var val = parseInt(input.val());
            if (val >= maxnrg) {
                input.val(maxnrg);
            }
        });
        
         
    })
    
    $("#addChar").click(() => {
        var name = $("#name").val();
        var nrg = parseInt( $("#nrg").val() );
        $("#name").val("");
        $("#nrg").val(0);
        
        if (name && name != "") {
            insertChar(name, nrg);
        }
        
    });
    
    //$('.modal-trigger').leanModal();
    //$("#deleteModalCancel").click(()=>{ $("#deleteModal").closeModal(); });
    $("#save").click(() => { save(); });
    $("#clear").click(() => { clear(); });
    
    
    $("input[name='onlineGroup']").change((e)=>{
        console.log("Online group changed");
        console.log(e);
        var parent = $(e.target).parent();
        console.log();
    });
    
    var lastUpdate = new Date().getTime();
    
    interval = setInterval(()=>{
        var now = new Date().getTime();
        var diff = now-lastUpdate;
        var dosave = false;
        
        var seconds = diff / 1000;
        for (var key in chars) {
            var char = chars[key];
            var lastFloor = Math.floor(char.nrg);
            var online = $("#online__"+char.uid).is(":checked");
            
            var inBed = $("#bed").is(":checked");
            var cashBed = $("#cashBed").is(":checked");
            
            var $div = $("#char"+char.uid);
            var regenRate = OFFLINE_ENERGY_PER_SECOND;
            if (online) { 
                regenRate = ONLINE_ENERGY_PER_SECOND;
                if (cashBed) { regenRate *= 3; }
                else if (inBed) { regenRate *= 2; }
                if ($div.hasClass("blue-grey")) {
                    $div.removeClass("blue-grey");
                    $div.addClass("teal");
                }
            } else {
                if ($div.hasClass("teal")) {
                    $div.removeClass("teal");
                    $div.addClass("blue-grey");
                }
                
            }
            
            
            char.nrg += regenRate * seconds;
            char.nrg = clamp(char.nrg, 0, maxnrg);
            
            var nowFloor = Math.floor(char.nrg);
            
            var p = cent(char.nrg, maxnrg);
            setProgress("#progress__" + char.uid, p);
            
            var $eta = $("#eta__" + char.uid);
            $eta.text(eta(char.nrg, maxnrg, regenRate));
    
            
            if (nowFloor > lastFloor) {
                $("#nrg__" + char.uid).val(Math.floor(char.nrg));
                dosave = true;
            }
            
        }
        if (dosave) { save(); }
        
        lastUpdate = now;
    }, 111);
})


function cent(cur, max) { return Math.floor(cur / max * 10000) / 100}


function timeFormat(sc) {
    var days = Math.floor(sc / (60 * 60 * 24));
    sc -= days * (60 * 60 * 24);
    
    var hr = Math.floor(sc / (60 * 60));
    sc -= hr * (60 * 60);
    
    var mn = Math.floor(sc / 60);
    sc -= mn * 60;
    
    sc = Math.floor(sc);
    var str = "";
    if (days > 0) { str += days + " Days and "; }
    
    str += hr + ":";
    if (mn < 10) { str += "0"; }
    str += mn + ":";
    if (sc < 10) { str += "0"; }
    str += sc;
    
    return str;
}
function eta(cur, max, rate) {
    var sc = (max-cur) / rate;
    return "ETA: " + timeFormat(sc);
}

function sizeOf(obj) {
    var count = 0;

    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            ++count;
    }

    return count;
}

function save(initial) {    
    setCookie("cnt", sizeOf(chars));
    setCookie("last", ""+new Date().getTime());
    setCookie("maxnrg", ""+maxnrg);
    var bed = "noBed";
    if ($("#bed").is(":checked")) { bed = "bed"; }
    if ($("#cashBed").is(":checked")) { bed = "cashBed"; }
    setCookie("bed", bed);
    
    var i = 0;
    console.log(chars);
    for (var key in chars) {
        var val = chars[key];
        setCookie("name__" + i, val.name);
        setCookie("nrg__" + i, val.nrg);
        setCookie("uid__" + i, val.uid);
        var online = $("#online__"+val.uid).is(":checked");
        setCookie("online__" + i, online ? "true" : "");
        i++;
    }
    if (!initial) {
        Materialize.toast("Saved!", 3000, "blue darken-4 rounded");
    } else {
        var diff = new Date().getTime() - lastSave;
        if (diff > 99) {
            var time = timeFormat(diff/1000);
            Materialize.toast("Welcome back! Last time was " + time + " ago!", 3000, "green darken-4 rounded");
        } else {
            Materialize.toast("Hello, stranger!", 3000, "green rounded" )
        }
    }
    
}
function clear() {
    maxnrg = MAX_NRG_DEFAULT;
    $("#maxnrg").val(maxnrg);
    
    chars = {};
    $("#cardContainer").empty();
    
    var cookies = document.cookie.split(";");
    function eraseCookie(name) { document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;'; } 
    for (var i = 0; i < cookies.length; i++) {
        eraseCookie(cookies[i].split("=")[0]);
    }
    
    Materialize.toast("Cleared!", 3000, "red darken-4 rounded");
}
//MS per second per minute per half hour
var MS_IN_HALF_HOUR = 1000 * 60 * 30

function insertChar(name, nrg, online, uid, last) {
    var saveAfter = (!last);
    
    if (!uid) { uid = guid(); }
    if (!last) { last = new Date().getTime(); }
    var $div = $("<div>", {id: "char"+uid, class:"col s12 row card packed blue-grey darken-3"})
    
    var lastD = new Date(last);
    var nowD = new Date();
    
    var diffMS = nowD.getTime() - lastD.getTime();
    
    var nrgRecovery = (diffMS / 1000) * OFFLINE_ENERGY_PER_SECOND;

    nrg += nrgRecovery;
    if (nrg > maxnrg) { nrg = maxnrg; }
    var c = {};
    c.name = name;
    c.nrg = nrg;
    c.uid = uid;
    chars[uid] = c;
    
    $cardContainer = $("#cardContainer");
    $cardContainer.append($div);
    var $name = inputField("name__"+uid, "text", "Name", "col s5");
    $name.find("input").val(name);
    $name.change(()=>{
        var val = $("#name__"+uid).val();
        chars[uid].name = val;
    });
    $div.append($name);
    
    
    var $nrg = inputField("nrg__"+uid, "number", "Energy", "col s3 nrg");
    $nrg.find("input").val(""+Math.floor(nrg));
    $nrg.change(()=>{
        var elem = $("#nrg__"+uid);
        var val = parseInt(elem.val());
        if (val > maxnrg) { val = maxnrg; }
        var p = cent(val, maxnrg);
        
        var $eta = $("#eta__"+uid);
        $eta.text(eta(nrg, maxnrg, OFFLINE_ENERGY_PER_SECOND));
    
        chars[uid].nrg = val;
        elem.val(val);
    });
    $div.append($nrg);
    
    var $delete = makeButton("deleteChar"+uid, "-", () => {
       showDeleteModal(uid);
    }, "red darken-4");
    $div.append($delete);
    
    var onlineData = { class:"with-gap", name:"onlineGroup", type:"radio", id:"online__"+uid };
    //if (online) { onlineData.checked = "checked"; }
    var $online = $("<input>", onlineData);
    if (online) { $online.attr("checked", "checked"); }
    $online.change(()=>{
        selectedOnline = uid;
        console.log(name + " changed online status");
    })
    
    var $onlineLabel = $("<label>", {for:"online__"+uid,})
    $onlineLabel.text("online?");
    
    $div.append($online);
    $div.append($onlineLabel);
    
    var $eta = $("<div>", {id:"eta__"+uid});
    $eta.text(eta(nrg, maxnrg, OFFLINE_ENERGY_PER_SECOND));
    $div.append($eta);
    
    var p = cent(nrg, maxnrg);
    var $bar = makeProgress("progress__"+uid, p);
    $div.append($bar);
    
    
    if (saveAfter) { save(); }
    
    return $div;
}

function showDeleteModal(target) {
    $("#deleteTargetName").text(chars[target].name);
    
    $("#deleteModal").openModal();
    
    $("#deleteModalConfirm").click(()=>{ 
        deleteChar(target); 
        $("#deleteModal").closeModal(); 
    });
    
}

function deleteChar(target) {
    $("#char"+target).remove();
    delete chars[target];
}

function makeButton(id, text, onclick, classes) {
    var $div = $("<div>", {id:id, class:"btn " + classes,});
    $div.click(onclick);
    $div.text(text);
    
    
    return $div;
}

function makeProgress(id, percentage, color) {
    if (!color) { color = "amber"; }
    var $div = $("<div>", {id:id, class:"progress bar lighten-5 " + color});
    
    var $bar = $("<div>", {class:"determinate darken-3 " + color, style:"width: " + percentage + "%"})
    $div.append($bar);
    
    return $div;
}

function setProgress(selector, percentage) {
    var $selected = $(selector);
    var $bar = $selected.find(".determinate");
    $bar.css("width", "" + percentage + "%");
}

function inputField(id, type, label, classes) {
    classes = classes || "";
    var $div = $("<div>", {class:"input-field " + classes});
    var $input = $("<input>", {id:id, type:type, class:"packed"});
    var $label = $("<label>", {for:id, class:"active tiny"})
    $div.append($input);
    
    $label.text(label);
    $div.append($label);
    
    return $div;
}


var MS_IN_DAY = 24*60*60*1000;
var DEFAULT_DAYS = 3600// about 10 years lol
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    if (!exdays) { exdays = DEFAULT_DAYS; } 
    d.setTime(d.getTime() + (exdays * MS_IN_DAY));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}