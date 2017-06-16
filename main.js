import {createStore, combineReducers} from 'redux';
import {Provider, connect} from 'react-redux';
import React from 'react';
import ReactDOM from 'react-dom';
import Map from 'ol/map';
import View from 'ol/view';
import TileLayer from 'ol/layer/tile';
import XYZ from 'ol/source/xyz';
import VectorLayer from 'ol/layer/vector';
import VectorSource from 'ol/source/vector';
import GeoJSONFormat from 'ol/format/geojson';
import Style from 'ol/style/style';
import CircleStyle from 'ol/style/circle';
import FillStyle from 'ol/style/fill';
import SelectInteraction from 'ol/interaction/select';
import proj from 'ol/proj';

import uuid from 'uuid';

import { apply } from 'ol-mapbox-style';

// reducer
const layers = (state = [], action) => {
  switch (action.type) {
    case 'ADD_LAYERS':
      console.log(action.layers);
      return state.concat(action.layers);
    default:
      return state;
  } 
};

const layersApp = combineReducers({
  layers
});

// action creator
function addLayers(layers) {
  return {
    type: 'ADD_LAYERS',
    layers
  };
}

const store = createStore(layersApp, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

fetch('wms.json')
  .then(function(response) {
  return response.json()
}).then(function(json) {
  apply('map', 'wms.json');
  store.dispatch(addLayers(json.layers));
}).catch(function(ex) {
  console.log('parsing failed', ex)
});

ReactDOM.render(
  <Provider store={store}>
    <div>
    </div>
  </Provider>
, document.getElementById('map'));
