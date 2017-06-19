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

const layers = (state = [], action) => {
  switch (action.type) {
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
  map,
  layers
});

// action creators
function removeLayer(layer) {
  return {
    type: 'REMOVE_LAYER',
    layer
  };
}

//const store = createStore(layersApp, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

fetch('wms.json')
  .then(function(response) {
  return response.json()
}).then(function(json) {
  const store = createStore(layersApp, json);
  ReactDOM.render(
    <Provider store={store}>
      <div>
        <LayerList />
        <MapSync />
      </div>
    </Provider>
  , document.getElementById('map'));
  apply('map', 'wms.json');
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
  console.log(state);
  return {
    layers: state.layers
  };
}

const mapDispatchToProps = (dispatch) => ({
  onRemove(layer) {
    dispatch(removeLayer(layer));
  }
});

class MapSync extends React.Component {
  componentWillReceiveProps(nextProps) {
    // TODO update map
    console.log(nextProps);
  }
  render() {
    return (<div/>);
  }
}

MapSync = connect(mapStateToProps)(MapSync);

LayerList = connect(mapStateToProps, mapDispatchToProps)(LayerList);
