﻿module BtPo.UI {    
    var CSSTransitionGroup = React.addons.CSSTransitionGroup;

    class PlaylistItem extends React.Component<any, any> {
        render() {
            return (<div key={this.props.data.id} className={ (Kodi.NowPlaying.current.id==this.props.data.id) ? "playlist-item current" : "playlist-item" }>
                <img src={ this.props.picture } className="thumbnail" draggable={false} />
                <div className="desc">
                    <div className="title">{this.props.data.label}</div>
                    <div className="album">
                        <div>{this.props.data.artist}</div>
                        <div>{this.props.data.album}</div>
                    </div>
                </div>
                <div className="actions">
                    <button className="blink btnplay btpo-play"></button>
                    <button className="blink btnremove btpo-close"></button>
                </div>
            </div>);
        }

        componentDidMount() {
            var node = React.findDOMNode(this) as HTMLElement;
            node.style.opacity = '0';
            var delay = Math.max(this.props.index*40, 300);
            setTimeout(function () {                 
                WinJSContrib.UI.Animation.slideFromBottom(node);
            }, delay);
            this.registerEvents(node);
        }

        componentDidUpdate() {
            var node = React.findDOMNode(this) as HTMLElement;
            this.registerEvents(node);
        }

        componentWillUpdate(nextProps, nextState) {
            var node = React.findDOMNode(this) as HTMLElement;
            var targeturl = Kodi.API.kodiThumbnail(nextProps.data.thumbnail);
            var thumbnail = node.querySelector(".thumbnail") as HTMLImageElement;
            if (thumbnail && thumbnail.src == targeturl) {
                nextProps.picture = thumbnail.src;
            }
        }

        registerEvents(node) {            
            var thumbnail = node.querySelector(".thumbnail") as HTMLImageElement;
            if (!thumbnail.src) {
                Kodi.Utils.toThumbnailBg(this.props.data, ['thumbnail'], thumbnail, ['src']);
            }
            var btnplay = node.querySelector(".btnplay");
            WinJSContrib.UI.tap(btnplay, () => {
                return Kodi.API.Player.moveTo(Kodi.NowPlaying.current.playerid, this.props.index).then(() => {
                    var e = document.createEvent('Event');
                    e.initEvent('refreshplaylist', true, true);
                    node.dispatchEvent(e);
                });
            });

            var btnremove = node.querySelector(".btnremove");
            WinJSContrib.UI.tap(btnremove, () => {
                return Kodi.API.PlayList.removeAt(Kodi.NowPlaying.current.playlistid, this.props.index).then(() => {
                    return WinJSContrib.UI.removeElementAnimation(node).then(() => {
                        var e = document.createEvent('Event');
                        e.initEvent('refreshplaylist', true, true);
                        node.dispatchEvent(e);
                    });
                });
            });
        }
    }

    class PlaylistItemsList extends React.Component<any, any> {
        render() {
            this.props.items = this.props.items || [];

            return (<div className="playlist-items">
                        {this.props.items.map(function(item, idx) {
                        return <PlaylistItem index={idx} data={item} />
                        })}
            </div>);
        }
    }

    export class ReactPlayListControl {
        element: HTMLElement;
        eventTracker: WinJSContrib.UI.EventTracker;
        compFactory: any;
        throttle: number;
        _items: any;
        lastrefresh: Date;
        component: any;

        constructor(element?: HTMLElement, options?) {
            this.element = element || document.createElement('DIV');
            this.eventTracker = new WinJSContrib.UI.EventTracker();
            options = options || {};
            this.element.winControl = this;
            this.element.classList.add('reactplaylistcontrol');
            this.element.classList.add('win-disposable');
            this.element.classList.add('mcn-layout-ctrl');
            WinJS.UI.setOptions(this, options);
            this.compFactory = React.createFactory(PlaylistItemsList);

            this.eventTracker.addEvent(this.element, "refreshplaylist", () => {
                this.refresh();
            });

            this.eventTracker.addBinding(Kodi.NowPlaying.current, "id", () => {
                this.refresh();
            });

            this.eventTracker.addBinding(Kodi.NowPlaying.current, "expanded", () => {
                this.refresh();
                if (!Kodi.NowPlaying.current.expanded) {
                    this.element.innerHTML = "";
                }
            });

            this.eventTracker.addEvent(WinJS.Application, "Playlist.OnAdd", () => {
                clearTimeout(this.throttle);
                this.throttle = setTimeout(() => {
                    var now = new Date() as any;
                    var last = this.lastrefresh as any;
                    var delta = now - last;
                    if (delta > 1000) {
                        this.refresh();
                    }
                }, 700);

            });
        }

        get items() {
            return this._items;
        }

        set items(val) {
            this._items = val;
            this.refresh();
        }

        refresh() {
            if (Kodi.NowPlaying.current.expanded) {
                console.info("refresh playlist");
                Kodi.API.PlayList.getItems(Kodi.NowPlaying.current.playlistid).then((playlist) => {
                    this._items = playlist.items;

                    this.component = React.render(this.compFactory({ items: this.items }), this.element);
                    this.lastrefresh = new Date();
                }, (err) => {
                    console.error(err);
                });
            }
        }
    }
}