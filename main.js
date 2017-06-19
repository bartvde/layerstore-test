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

const center = (state = [0, 0], action) => {
  switch (action.type) {
    case 'SET_CENTER':
      return action.center;
    default:
      return state;
  }
};

const layersApp = combineReducers({
  layers,
  center
});

// action creators
function removeLayer(layer) {
  return {
    type: 'REMOVE_LAYER',
    layer
  };
}

function setCenter(center) {
  return {
    type: 'SET_CENTER',
    center
  };
}

//const store = createStore(layersApp, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

fetch('wms.json')
  .then(function(response) {
  return response.json()
}).then(function(json) {
  const store = createStore(layersApp, json);
  global.store = store;
  ReactDOM.render(
    <Provider store={store}>
      <div>
        <LayerList />
        <MapSync />
      </div>
    </Provider>
  , document.getElementById('map'));
  var map = apply('map', 'wms.json');
  map.on('moveend', function(evt) {
    var view = evt.target.getView();
    var center = proj.toLonLat(view.getCenter(), view.getProjection());
    store.dispatch(setCenter(center));
  });
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
