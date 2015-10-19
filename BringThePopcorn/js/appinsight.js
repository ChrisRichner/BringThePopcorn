﻿/// <reference path="../scripts/microsoft.applicationinsights.js" />

var BtPo = BtPo || {};
(function () {
    'use strict';

    if (!BtPo.trackerInstrumentationKey) {
        BtPo.tracker = {
            trackEvent: function () { },
            trackException: function () { },
            trackPageView: function () { },
            trackPageViewInternal: function () { },
            trackPageVisitTime: function () { },
            trackMetric: function () { },
            trackTrace: function () { },
        };
        return;
    }
        

    BtPo.tracker = new Microsoft.ApplicationInsights.AppInsights({
        endpointUrl: "http://dc.services.visualstudio.com/v2/track",
        enableDebug: true,
        autoCollectErrors: true,
        instrumentationKey: BtPo.trackerInstrumentationKey
    });

    function merge(source, addendum) {
        for (var n in addendum) {
            source[n] = addendum[n];
        }
    }

    function getHardwareId() {
        var token = Windows.System.Profile.HardwareIdentification.getPackageSpecificToken(null);
        var hardwareId = token.id;
        var dataReader = Windows.Storage.Streams.DataReader.fromBuffer(hardwareId);

        var bytes = [];
        dataReader.readBytes(bytes);

        return bytes.toString();
    }

    function getNewtworkAdapter() {
        var profiles = Windows.Networking.Connectivity.NetworkInformation.getConnectionProfiles();
        var na = profiles[0].networkAdapter;
        return na.ianaInterfaceType.toString();
    }


    var version = Windows.ApplicationModel.Package.current.id.version;
    var devicetoken = Windows.System.Profile.HardwareIdentification.getPackageSpecificToken(null);
    var deviceid = getHardwareId();
    var tagsComplement = {
        "ai.application.ver": version.major + '.' + version.minor + '.' + version.build + "." + version.revision,
        "ai.device.type": "Phone",
        "ai.device.id": deviceid,
        "ai.device.oemName": "Dell inc.",
        "ai.device.model": "ukn",
        "ai.device.network": getNewtworkAdapter(),
        "ai.device.language": "en-US",
        "ai.user.storeRegion": "FR",
        "ai.user.accountAcquisitionDate": "2015-10-19T14:25:10.1780423+02:00"
    }

    BtPo.tracker.context.addTelemetryInitializer(function (envelope) {
        merge(envelope.tags, tagsComplement);
        var telemetryItem = envelope.data.baseData;
        var msprefix = "Microsoft.ApplicationInsights.";
        var itemType = null;
        if (envelope.name.indexOf(msprefix) == 0) {
            itemType = envelope.name.substr(msprefix.length);
            var newenveloppe = msprefix + envelope.iKey.replace(/-/g, '') + '.' + itemType;
            envelope.name = newenveloppe;
        }

        if (itemType === "Exception" && telemetryItem.exceptions) {
            telemetryItem.exceptions.forEach(function (e) {
                e.id = 62619566;
                e.typeName = e.message;
            });
        }
    });


    BtPo.tracker.trackEvent("app start");



    WinJS.Application.addEventListener("error", function (arg) {
        arg.detail.setPromise(WinJS.Promise.timeout(10000));
        BtPo.tracker.trackException(arg.detail.error, "Unhandled");
        BtPo.tracker.flush();

        WinJS.Navigation.navigate("/pages/errorpage/errorpage.html");
        return true;
    });
})();