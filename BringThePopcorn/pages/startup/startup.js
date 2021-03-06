﻿var BtPo;
(function (BtPo) {
    var UI;
    (function (UI) {
        var Pages;
        (function (Pages) {
            var StartUpPage = (function () {
                function StartUpPage() {
                }
                StartUpPage.prototype.init = function (element, options) {
                    document.body.classList.add("unconnected");
                };
                StartUpPage.prototype.processed = function (element, options) {
                    var _this = this;
                    this.eventTracker.addEvent(this.serversettings, "settingslistmessage", function (arg) {
                        if (arg.detail.message) {
                            _this.messages.innerHTML = arg.detail.message;
                        }
                    });
                };
                StartUpPage.prototype.ready = function (element, options) {
                };
                StartUpPage.prototype.pageNavActivate = function () {
                    this.serversettings.renderSettings();
                };
                StartUpPage.url = "/pages/startup/startup.html";
                return StartUpPage;
            })();
            Pages.StartUpPage = StartUpPage;
            WinJS.UI.Pages.define(StartUpPage.url, StartUpPage);
        })(Pages = UI.Pages || (UI.Pages = {}));
    })(UI = BtPo.UI || (BtPo.UI = {}));
})(BtPo || (BtPo = {}));

//# sourceMappingURL=../../../BringThePopcorn/pages/startup/startup.js.map