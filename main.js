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
      return state.concat(action.layers);
    case 'REMOVE_LAYER':
      const index = state.indexOf(action.layer);
      return [
        ...state.slice(0, index),
        ...state.slice(index + 1)
      ];
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

function removeLayer(layer) {
  return {
    type: 'REMOVE_LAYER',
    layer
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

let LayerList = ( {layers, onRemove} ) => {
  var items = layers.map((layer, idx) => {
    return (<li key={idx}>{layer.id}<button onClick={onRemove.bind(this, layer)}>Remove</button></li>);
  });
  return (<ul>{items}</ul>);
}

const mapStateToProps = (state) => {
  return {
    layers: state.layers
  };
}

const mapDispatchToProps = (dispatch) => ({
  onRemove(layer) {
    dispatch(removeLayer(layer));
  }
});

LayerList = connect(mapStateToProps, mapDispatchToProps)(LayerList);

ReactDOM.render(
  <Provider store={store}>
    <div>
      <LayerList />
    </div>
  </Provider>
, document.getElementById('map'));
