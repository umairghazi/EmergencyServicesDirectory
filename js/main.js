/**
 * Created by umairghazi on 12/12/15.
 */

(function () {
    /** GLOBALS **/
    var url = "https://people.rit.edu/dmgics/754/23/proxy.php";
    var http = new XMLHttpRequest();
    var app = angular.module('RestClientApp', ['angularUtils.directives.dirPagination']);

    //Main Controller
    app.controller("bodyController", ['$http', '$scope', function ($http, $scope) {
        var self = this;
        $scope.stateSelect = $scope.stateSelect || 'NY';
        self.orgSelect = "";
        $scope.showModal = false;
        $scope.toggleModal = function () {
            $scope.showModal = !$scope.showModal;
        };

        //Get org types
        self.getOrgTypes = function () {
            $http.get(url, {
                params: {path: '/OrgTypes'},
                responseType: 'document'
            }).success(self.handleOrgTypes);

        };
        self.handleOrgTypes = function (xmlDoc) {
            self.orgTypes = [];
            if($("row", xmlDoc).length === 0){
                self.orgTypes.push({cityName: "No Organization Type Found", value: "No Organization Type found"});
            } else {
                self.orgTypes.push({orgName:"All Organization Types", value:""});
                $("row",xmlDoc).each(function(){
                    var org = $(this).find("type")[0].innerHTML;
                    self.orgTypes.push({orgName: org, value: org});
                });
            }
        };

        //Get cities
        self.getCities = function (state) {
            $http.get(url, {
                params: {path: '/Cities?state=' + state},
                responseType: 'document'
            }).success(self.handleCity);
        };
        self.handleCity = function (xmlDoc) {
            self.cities = [];

            if($("row", xmlDoc).length === 0){
                self.cities= [{cityName: "No City Found", value:""}];
            } else{
                self.cities.push({cityName:"All Cities", value:""});
                $("row",xmlDoc).each(function(){
                    var city= $(this).find("city")[0].innerHTML;
                    self.cities.push({cityName: city, value: city});
                });
            }
        };
        /********************** End of handleCity() ***********************/

        self.showResults = function () {
            $http.get(url, {
                params: {path: "/Organizations?" + $("#searchForm").serialize()},
                responseType: "document"
            }).success(self.handleSearchResults);
        };

        self.handleSearchResults = function (xmlDoc) {
            self.tableItems = [];

            $("row", xmlDoc).each(function () {
                    self.tableItems.push(
                        {
                            id:     $("OrganizationID", this).text(),
                            type:   $("type"          , this).text(),
                            name:   $("Name"          , this).text(),
                            city:   $("city"          , this).text(),
                            county: $("CountyName"    , this).text(),
                            state:  $("State"         , this).text(),
                            zip:    $("zip"           , this).text()
                        }
                );
            });
        };


        //Get tabs
        self.getTabs = function (row) {
            self.item = row.id;
            console.log(row.id);
            $http.get(url, {
                params: {path: "/Application/Tabs?orgId=" + row.id},
                responseType: "document"
            }).success(self.handleTabs);
        };

        self.handleTabs = function (xmlDoc) {
            self.tabs = [];
            $("row", xmlDoc).each(function () {
                self.tabs.push(
                    $(this).text()
                )
            });
            self.setTab('General');
        };

        //Get data for general tab
        self.getGeneral = function () {
            $http.get(url, {
                params: {path: "/" + self.item + "/General"},
                responseType: "document"
            }).success(self.handleGeneral);
        };

        self.handleGeneral = function (xmlDoc) {
            self.generalData = [];
            $("data", xmlDoc).each(function () {
                self.generalData.push(
                    {key: 'Name:'        , value: $("name"       , this).text()},
                    {key: 'Email:'       , value: $("email"      , this).text()},
                    {key: 'Website:'     , value: $("website"    , this).text()},
                    {key: 'Description:' , value: $("description", this).text()},
                    {key: 'Num numbers:' , value: $("nummembers" , this).text()},
                    {key: 'Num calls:'   , value: $("numcalls"   , this).text()},
                    {key: 'Service Area:', value: $("serviceArea", this).text()}
                )

            });
        };

        //Get data for location tab
        self.getLocation = function () {
            $http.get(url, {
                params: {path: "/" + self.item + "/Locations"},
                responseType: "document"
            }).success(self.handleLocation);
        };

        self.handleLocation = function (xmlDoc) {
            self.locationOptions = [];

            if ($("location", xmlDoc).length === 0) {
                self.locationOptions = [{locType: "none", value: ""}];
            } else {
                $("location", xmlDoc).each(function () {
                    var locationType = $(this).find("type").text();
                    self.locationOptions.push({locType: locationType, value: locationType});
                });
                //Gets the default option in select dropdown
                self.selectedLocation = self.locationOptions[0].locType;
                self.getLocationDetails();

            }
        };

        //Get location data for location table
        self.getLocationDetails = function () {
            $http.get(url, {
                params: {path: "/" + self.item + "/Locations"},
                responseType: "document"
            }).success(function (xmlDoc) {
                    self.locationDetails = [];
                    $("location", xmlDoc).each(function () {
                        if (self.selectedLocation === $("type", this).text()) {
                            self.locationDetails.push(
                                {name: 'Type:'      , value: $("type"       , this).text()},
                                {name: 'Address1:'  , value: $("address1"   , this).text()},
                                {name: 'Address2:'  , value: $("address2"   , this).text()},
                                {name: 'city:'      , value: $("city"       , this).text()},
                                {name: 'state:'     , value: $("state"      , this).text()},
                                {name: 'zip:'       , value: $("zip"        , this).text()},
                                {name: 'phone:'     , value: $("phone"      , this).text()},
                                {name: 'ttyphone:'  , value: $("ttyphone"   , this).text()},
                                {name: 'fax:'       , value: $("fax"        , this).text()},
                                {name: 'latitude:'  , value: $("latitude"   , this).text()},
                                {name: 'longitude:' , value: $("longitude"  , this).text()},
                                {name: 'countyId:'  , value: $("countyId"   , this).text()},
                                {name: 'countyName:', value: $("countyName" , this).text()},
                                {name: 'siteId:'    , value: $("siteId"     , this).text()}
                            );
                            //Address string for google map
                            var gmapAdd = $(this).find('address1').text() + " " + $(this).find('city').text() + " " + $(this).find('state').text() + " " + $(this).find('zip').text();
                            self.initMap(parseFloat($("latitude", this).text()), parseFloat($("longitude", this).text()), gmapAdd);

                        }
                    });
                }
            )
        };

        self.initMap = function (lat, lon, gmapAdd) {  //Calls google map api
            var map = new google.maps.Map(document.getElementById('googleMap'), {
                center: {lat: 43.161030, lng: -77.610924},
                zoom: 12
            });
            console.log(lat, lon, gmapAdd);
            //if coordinates are not present, use the address to fetch map
            if (lat === null || lat === 'null' || lat === undefined || lat === '' || isNaN(lat)) {
                console.log("No coordinates");
                var geocoder = new google.maps.Geocoder();
                geocoder.geocode({'address': gmapAdd}, function (results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        map.setCenter(results[0].geometry.location);
                        var marker = new google.maps.Marker({
                            map: map,
                            position: results[0].geometry.location
                        });
                    } else {
                        alert("Geocode was not successful for the following reason: " + status);
                    }
                });
            }
            else {
                //else create map using coordinates
                console.log("in else");
                var markerPos = {lat: lat, lng: lon};
                var map = new google.maps.Map(document.getElementById('googleMap'), {
                    center: markerPos,
                    zoom: 8
                });
                var marker = new google.maps.Marker({
                    position: markerPos,
                    map: map

                });
            }
        };

        //Get treatment data
        self.getTreatment = function () {
            $http.get(url, {
                params: {path: "/" + self.item + "/Treatments"},
                responseType: "document"
            }).success(function (xmlDoc) {
                self.treatmentData = [];
                if ($("treatment", xmlDoc).length === 0) {
                    self.treatmentData = ["No data present"];
                } else {
                    $("treatment", xmlDoc).each(function () {

                        self.treatmentData.push(
                            [
                                $("type"        , this).text(),
                                $("abbreviation", this).text()
                            ]
                        )

                    });
                }

            });
        };


        //Get training data
        self.getTraining = function () {
            $http.get(url, {
                params: {path: "/" + self.item + "/Training"},
                responseType: "document"
            }).success(function (xmlDoc) {
                self.trainingData = [];
                if ($("training", xmlDoc).length === 0) {
                    self.trainingData = ["No data present"];
                } else {
                    $("training", xmlDoc).each(function () {

                        self.trainingData.push(
                            [
                                $("type", this).text(),
                                $("abbreviation", this).text()
                            ]
                        )

                    });
                }
            });
        };

        //Get facility data
        self.getFacility = function () {
            $http.get(url, {
                params: {path: "/" + self.item + "/Facilities"},
                responseType: "document"
            }).success(function (xmlDoc) {
                self.facilityData = [];
                if ($("facility", xmlDoc).length === 0) {
                    self.facilityData = ["No data present"];
                } else {
                    $("facility", xmlDoc).each(function () {

                        self.facilityData.push(
                            [
                                $("type", this).text(),
                                $("quantity", this).text(),
                                $("description", this).text()
                            ]
                        )
                    });
                }
            });
        };

        ////Get equipment data
        self.getEquipment = function () {
            $http.get(url, {
                params: {path: "/" + self.item + "/Equipment"},
                responseType: "document"
            }).success(function (xmlDoc) {
                self.equipmentData = [];
                if ($("equipment", xmlDoc).length === 0) {
                    self.equipmentData = ["No data present"];
                } else {
                    $("equipment", xmlDoc).each(function () {

                        self.equipmentData.push(
                            [
                                $("type", this).text(),
                                $("quantity", this).text(),
                                $("description", this).text()
                            ]
                        )
                    });
                }
            });
        };


        //Get physician data
        self.getPhysician = function () {
            $http.get(url, {
                params: {path: "/" + self.item + "/Physicians"},
                responseType: "document"
            }).success(function (xmlDoc) {
                self.physicianData = [];
                if ($("physician", xmlDoc).length === 0) {
                    self.physicianData = ["No data present"];
                } else {
                    $("physician", xmlDoc).each(function () {

                        self.physicianData.push(
                            [
                                $("fName", this).text() + " " + $("mName", this).text() + " " + $("lName", this).text(),
                                $("license", this).text(),
                                $("phone", this).text()
                            ]
                        )
                    });
                }
            });
        };
        ////Get people data
        self.getPeople = function () {
            $http.get(url, {
                params: {path: "/" + self.item + "/People"},
                responseType: "document"
            }).success(function (xmlDoc) {
                self.siteData = [];
                if ($("site", xmlDoc).length === 0) {
                    self.siteData = [{siteAddress: "none", value: ""}];
                } else {
                     //self.locationOptions.push({locType:"All Locations", value:""});
                    $("site", xmlDoc).each(function () {
                        var sAddress = $(this).attr("address");
                        var sId = $(this).attr("siteId");
                        self.siteData.push({siteAddress: sAddress, value: sId});

                    });
                }
            });
        };

        //Get people for a particular site
        self.getSiteDetails = function () {
            $http.get(url, {
                params: {path: "/" + self.item + "/People"},
                responseType: "document"
            }).success(function (xmlDoc) {
                self.siteDetails = [];
                $("site", xmlDoc).each(function () {
                    if (self.selectedSite === $(this).attr("siteId")) {
                        $("person", this).each(function () {
                            self.siteDetails.push(
                                [
                                    $("lName", this).text(),
                                    $("role", this).text()
                                ]
                            )
                        });
                    }
                });
            });
        };

        //Check which tab is set
        //and call the particular tab
        self.isSet = function (checkTab) {
            return self.tab === checkTab;
        };

        self.setTab = function (setTab) {
            self.tab = setTab;
            self.getTabInfo(self.tab);
        };

        self.getTabInfo = function (selectedTab) {
            if (selectedTab === 'General') {
                self.getGeneral();
            } else if (selectedTab === 'Locations') {
                self.getLocation();
            } else if (selectedTab === 'Treatment') {
                self.getTreatment();
            } else if (selectedTab === 'Training') {
                self.getTraining();
            } else if (selectedTab === 'Facilities') {
                self.getFacility();
            } else if (selectedTab === 'Equipment') {
                self.getEquipment();
            } else if (selectedTab === 'Physicians') {
                self.getPhysician();
            } else if (selectedTab === 'People') {
                self.getPeople();
            }

        };

    }]);

    /* End of Controller */

    app.directive('modal', function () {
        return {
            template: '<div class="modal fade">' +
            '<div class="modal-dialog modal-lg">' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
            '<h4 class="modal-title">{{ title }}</h4>' +
            '</div>' +
            '<div class="modal-body" ng-transclude>' +
            '</div>' +
            '</div>' +
            '</div>',
            restrict: 'E',
            transclude: true,
            replace: true,
            scope: true,
            link: function postLink(scope, element, attrs) {
                scope.title = attrs.title;

                scope.$watch(attrs.visible, function (value) {
                    if (value == true)
                        $(element).modal('show');
                    else
                        $(element).modal('hide');
                });

                $(element).on('shown.bs.modal', function () {
                    scope.$apply(function () {
                        scope.$parent[attrs.visible] = true;
                    });
                });

                $(element).on('hidden.bs.modal', function () {
                    scope.$apply(function () {
                        scope.$parent[attrs.visible] = false;
                    });
                });
            }
        };
    });
    /* End of app directive */
})();
/* End of app closure */