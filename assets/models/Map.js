import { JAWG_ACCESS_TOKEN } from '../../constants.js';
class Map {
  map = null;
  mapLayers = new L.LayerGroup();
  currentMarker = null;
  relativeMarker = null;
  locationWatcher = null;
  static MAP_ID = 'map';
  static MAX_ZOOM = 22;
  static DEFAULT_MAP_ZOOM = 5; // If we don't set the zoom level, 5 is the default of Leaflet
  static FOCUSED_MAP_ZOOM = 16;
  static UNFOCUSED_MAP_ZOOM = 14;
  static REPORT_HAZARD_MAP_ZOOM = 16;
  static DEFAULT_LOCATION = {
    lat: 55.72,
    lng: -126.64,
  };

  static defaultIconAnchor = [20, 40];
  static defaultIconSize = [40, 40];
  static focusIconSize = [55, 55];
  static focusIconAnchor = [26.5, 55];

  constructor(lat, lng, customConfig = {}) {
    this.map = L.map(
      Map.MAP_ID,
      {
        zoomControl: false,
        maxBounds: [
          //south west
          [45.244, -148.711],
          //north east
          [62.227, -105.513],
        ],
      },
      { ...customConfig }
    ).setView([lat, lng], customConfig.MAP_ZOOM ?? Map.DEFAULT_MAP_ZOOM);

    L.tileLayer(`https://{s}.tile.jawg.io/jawg-terrain/{z}/{x}/{y}{r}.png?access-token=${JAWG_ACCESS_TOKEN}`, {
      attribution:
        '<a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      minZoom: 5,
      maxZoom: Map.MAX_ZOOM,
      accessToken: JAWG_ACCESS_TOKEN,
    }).addTo(this.map);

    document.getElementById('map').style.zIndex = 0;
  }

  static createIcon(iconParams = {}) {
    const icon = new L.Icon({
      iconUrl: `/assets/icons/${iconParams?.iconName ?? 'current-location-map-pin.svg'}`,
      iconSize: Map.defaultIconSize,
      iconAnchor: Map.defaultIconAnchor,
      ...iconParams,
    });
    return icon;
  }

  createLayerGroups(hazards, markerParams = {}) {
    hazards?.forEach((hazard) => {
      const categoryId = hazard?.hazardCategory?.id;
      const subCategoryId = hazard?.hazard?.id;
      const iconName = `marker/${hazard?.hazardCategory?.settings?.icon}.svg`;
      const iconNameFocus = `marker/${hazard?.hazardCategory?.settings?.icon}-focused.svg`;
      let pinIcon;

      if (markerParams.focus) {
        const focusParms = {
          iconName: iconNameFocus,
          iconSize: Map.focusIconSize,
          iconAnchor: Map.focusIconAnchor,
        };
        pinIcon = Map.createIcon(focusParms);
      } else {
        pinIcon = Map.createIcon({ iconName });
      }

      const marker = L.marker([hazard?.location?.lat, hazard?.location?.lng], {
        icon: pinIcon,
      });

      marker.id = hazard.id;
      marker.category_id = categoryId;
      marker.sub_category_id = subCategoryId;
      marker.active = false;
      marker.icon_name = iconName;
      marker.icon_name_focused = iconNameFocus;

      if (markerParams.event) marker.on(markerParams.event, () => markerParams.func(hazard?.id, hazard?.location?.lat, hazard?.location?.lng));

      this.mapLayers.addLayer(marker);
    });

    this.mapLayers.addTo(this.map);
  }

  checkMarkerOnMap(hazard) {
    for (const marker of this.mapLayers.getLayers()) {
      if (marker.id === hazard.id) {
        const iconName = marker.icon_name_focused;
        marker.setIcon(
          Map.createIcon({
            iconName,
            iconSize: Map.focusIconSize,
            iconAnchor: Map.focusIconAnchor,
          })
        );
        marker.active = true;
        return true;
      }
    }

    return false;
  }

  setMarkerOnMap(lat, lng, markerParams = {}) {
    if (this.currentMarker) this.map.removeLayer(this.currentMarker);

    const pinIcon = Map.createIcon({ iconName: markerParams.icon });
    this.currentMarker = L.marker([lat, lng], {
      ...markerParams.marker,
      icon: pinIcon,
    }).addTo(this.map);

    this.currentMarker.setZIndexOffset(200);
  }

  setRelativeMarkerOnMap(lat, lng, markerParams = {}) {
    if (this.relativeMarker) this.map.removeLayer(this.relativeMarker);
    if (!!markerParams.removeOnly) return;
    const pinIcon = Map.createIcon({
      iconName: 'location-pin-fill-red.svg',
      iconSize: [30, 30],
      iconAnchor: [20, 30],
    });
    this.relativeMarker = L.marker([lat, lng], {
      ...markerParams.marker,
      icon: pinIcon,
    }).addTo(this.map);
  }

  filterMarker(categoryIdArr = [], subCategoryIdArr = []) {
    this.mapLayers.eachLayer((marker) => {
      this.map.removeLayer(marker);
      if (subCategoryIdArr.length === 0 && (categoryIdArr.length === 0 || categoryIdArr.includes(marker.category_id))) {
        this.map.addLayer(marker);
      } else if (categoryIdArr.length === 0 && (subCategoryIdArr.length === 0 || subCategoryIdArr.includes(marker.sub_category_id))) {
        this.map.addLayer(marker);
      }
    });
  }

  filterMarkerCount(subCategoryIdArr = []) {
    let count = 0;

    // when no filter option is applied give count of all reports
    if (subCategoryIdArr.length === 0) {
      return this.mapLayers.getLayers().length;
    }

    this.mapLayers.eachLayer((marker) => {
      if (subCategoryIdArr.includes(marker.sub_category_id)) {
        count++;
      }
    });
    return count;
  }

  static watchGeoLocation(success, error, customOptions = {}) {
    // check if browser supports geolocation
    if (!('geolocation' in navigator)) {
      console.error('Geolocation not supported on your browser.');
      return;
    }

    // navigator options for better accuracy
    const navigatorOptions = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 10000,
      ...customOptions,
    };

    navigator.geolocation.watchPosition(
      async (data) => {
        const { coords } = data;
        this.locationWatcher = coords;
        success(data);
      },
      error,
      navigatorOptions
    );
  }

  static async getCurrentLocation() {
    // check if browser supports geolocation
    if (!('geolocation' in navigator)) {
      console.error('Geolocation not supported on your browser.');
      return;
    }

    // navigator options for better accuracy
    const navigatorOptions = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    };

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, navigatorOptions);
      });
      // get lat, long values
      const { latitude, longitude } = position.coords;
      return {
        lat: latitude,
        lng: longitude,
      };
    } catch (error) {
      console.error(error.message);
      //TODO: default lat, long values on error
      return Map.DEFAULT_LOCATION;
    }
  }
}

export default Map;
