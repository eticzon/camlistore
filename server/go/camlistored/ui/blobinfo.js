/*
Copyright 2011 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

// Gets the |p| query parameter, assuming that it looks like a blobref.
function getBlobParam() {
    var blobRef = getQueryParam('b');
    return (blobRef && isPlausibleBlobRef(blobRef)) ? blobRef : null;
}

function blobInfoUpdate(bmap) {
    var blobpre = document.getElementById('blobpre');
    var bd = document.getElementById("blobdownload")
    bd.innerHTML = "";
    var blobref = getBlobParam();
    if (!blobref) {
        alert("no blobref?");
        return;        
    }
    var binfo = bmap[blobref];
    if (!binfo) {
        blobpre.innerHTML = "(not found)";
        return;
    }
    blobpre.innerHTML = JSON.stringify(binfo, null, 2);
    if (binfo.camliType) {
        camliGetBlobContents(
            blobref,
            {
                success: function(data) {
                    document.getElementById("blobdata").innerHTML = linkifyBlobRefs(data);
                    if (binfo.camliType == "file") {
                        try { 
                            finfo = JSON.parse(data);
                            bd.innerHTML = "<a href=''></a>";
                            var fileName = finfo.fileName || blobref;
                            bd.firstChild.href = "./download/" + blobref + "/" + fileName;
                            bd.firstChild.innerText = fileName;
                            bd.innerHTML = "Download: " + bd.innerHTML;
                        } catch (x) {
                        }
                    }
                },
                fail: alert
            });
    } else {
        document.getElementById("blobdata").innerHTML = "Unknown/binary data; <a href='" + camliBlobURL(blobref) + "'>download</a>";
    }

    if (binfo.camliType && binfo.camliType == "permanode") {
        var claims = document.getElementById("claimsdiv");
        claims.style.visibility = "";
        camliGetPermanodeClaims(
            blobref,
            {
                success: function(data) {
                    document.getElementById("claims").innerHTML = linkifyBlobRefs(JSON.stringify(data, null, 2));
                },
                fail: function(msg) {
                    alert(msg);
                }
            });
    }

}

function blobInfoOnLoad() {
    var blobref = getBlobParam();
    if (!blobref) {
        return
    }
    var blobpre = document.getElementById('blobpre');
    blobpre.innerText = "(loading)";
    camliDescribeBlob(
        blobref,
        {
            success: blobInfoUpdate,
            fail: function(msg) {
                alert("Error describing blob " + blobref + ": " + msg);
            }
        }
    );
}

window.addEventListener("load", blobInfoOnLoad);
                            