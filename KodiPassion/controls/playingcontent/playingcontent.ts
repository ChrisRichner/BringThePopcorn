﻿module KodiPassion.UI {
    class PlayingContentControl {
        element: HTMLElement;
        currentContent: HTMLElement;
        eventTracker: WinJSContrib.UI.EventTracker;
        currentPlayerId: number;
        currentType: string;

        constructor(element, options) {
            this.element = element || document.createElement('DIV');
            this.eventTracker = new WinJSContrib.UI.EventTracker();
            options = options || {};
            this.element.winControl = this;
            this.element.classList.add('playingcontent');
            this.element.classList.add('win-disposable');
            this.element.classList.add('mcn-layout-ctrl');
            WinJS.UI.setOptions(this, options);

            this.eventTracker.addBinding(Kodi.NowPlaying.current, "id", () => {
                this.setCurrentItem();
            });

            this.eventTracker.addEvent(window, "resize", () => {
                this.updateLayout();
            });
            this.manageSmallScreen();
        }

        manageSmallScreen() {
            var controls = document.querySelectorAll("#nowplayingcontent .menubar .menu");
            for (var i = 0, l = controls.length; i < l; i++) {
                this.manageSmallScreenMenu(<HTMLElement>controls[i]);
            }
        }

        manageSmallScreenMenu(menu: HTMLElement) {
            var targetid = menu.getAttribute("target");
            if (targetid) {
                var target = <HTMLElement>document.getElementById(targetid);
                WinJSContrib.UI.tap(menu, function () {
                    var currentSelection = $("#nowplayingcontent .panel.selected");
                    if (!target.classList.contains("selected") || currentSelection.length > 1) {
                        $("#nowplayingcontent .menubar .menu.selected").removeClass("selected");
                        
                        menu.classList.add("selected");

                        if (currentSelection.length) {
                            dynamics.animate(currentSelection.get(0), { translateX: currentSelection.outerWidth() + 50 }, {
                                type: dynamics.spring,
                                duration: 350,
                                frequency: 1,
                                friction: 200,
                                complete: function () {
                                    currentSelection.removeClass("selected");
                                    currentSelection.get(0).style.transform = "";
                                }
                            });
                        }

                        dynamics.animate(target, { translateX : 0 }, {
                            type: dynamics.spring,
                            duration: 500,
                            frequency: 100,
                            friction: 210,
                            complete: function () {
                                target.classList.add("selected");
                                target.style.transform = "";
                            }
                        });
                    }
                });
            }
        }

        setCurrentItem() {
            var id = Kodi.NowPlaying.current.id;
            if (Kodi.NowPlaying.current.playerid != this.currentPlayerId || Kodi.NowPlaying.current.type != this.currentType) {
                this.currentPlayerId = Kodi.NowPlaying.current.playerid;
                this.currentType = Kodi.NowPlaying.current.type;
                this.closeCurrent().then(() => {
                    if (Kodi.NowPlaying.current.id != null && Kodi.NowPlaying.current.id != undefined) {
                        if (Kodi.NowPlaying.current.playlistid != null && Kodi.NowPlaying.current.playlistid != undefined) {
                            Kodi.API.PlayList.getItems(Kodi.NowPlaying.current.playlistid).then((playlist) => {
                                if (playlist.items && playlist.items.length > 1) {
                                    this.showPlayList(playlist.items);
                                } else {
                                    if (Kodi.NowPlaying.current.type === "movie") {
                                        this.showMovie();
                                    } else if (Kodi.NowPlaying.current.type === "episode") {
                                        this.showEpisode();
                                    } else if (Kodi.NowPlaying.current.type === "song") {
                                    }
                                }
                            });
                        } else {

                        }
                    }
                });
            }
        }

        showMovie() {
            Kodi.Data.loadRootData().then((data) => {
                var movie = data.movies.movies.filter((m) => {
                    return m.movieid == Kodi.NowPlaying.current.id
                })[0];
                if (movie) {
                    this.currentContent = document.createElement("DIV");
                    this.element.appendChild(this.currentContent);

                    var page = new KodiPassion.UI.Pages.MovieDetail(this.currentContent, { movie: movie });
                }
            });
        }

        showEpisode() {
        }

        showPlayList(items) {
            var playlistctrl = new KodiPassion.UI.PlayListControl();
            this.currentContent = playlistctrl.element
            this.element.appendChild(this.currentContent);
            playlistctrl.items = items;
        }

        closeCurrent() {
            if (this.currentContent) {
                $(this.currentContent).remove();
                var control = this.currentContent.winControl;
                if (control) {
                    if (control.dispose) {
                        control.dispose();
                    }
                }
                this.currentContent = null;
            }

            return WinJS.Promise.wrap();
        }

        updateLayout() {
            if (this.currentContent) {
                var control = this.currentContent.winControl;
                if (control) {
                    if (control.updateLayout) {
                        control.updateLayout();
                        var layoutcontrols = this.currentContent.querySelectorAll(".mcn-layout-ctrl");
                        for (var i = 0, l = layoutcontrols.length; i < l; i++) {
                            var ctrl = <HTMLElement>layoutcontrols[i];
                            if (ctrl.winControl && ctrl.winControl.updateLayout) {
                                ctrl.winControl.updateLayout();
                            }
                        }
                    }
                }
            }
        }

        dispose() {
            this.eventTracker.dispose();
        }
    }

    export var PlayingContent = WinJS.Class.mix(WinJS.Utilities.markSupportedForProcessing(PlayingContentControl), WinJS.Utilities.eventMixin,
        WinJS.Utilities.createEventProperties("myevent"));    
}