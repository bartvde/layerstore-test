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

const context = 'camo3d.json'

// the openlayers map
let map;

const layers = (state = [], action) => {
  let index;
  switch (action.type) {
    case 'TOGGLE_LAYER_VISIBILITY':
      index = state.indexOf(action.layer);
      var visible = action.layer.layout ? action.layer.layout.visibility : 'visible';
      return [
        ...state.slice(0, index),
        Object.assign({}, state[index], {layout: Object.assign({}, state[index].layout, {visibility: visible === 'visible' ? 'none' : 'visible'})}),
        ...state.slice(index + 1)
      ];
    case 'REMOVE_LAYER':
      index = state.indexOf(action.layer);
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

const zoom = (state = 0, action) => {
  return state;
};

const sources = (state = {}, action) => {
  return state;
};

const version = (state = 8, action) => {
  return state;
};

const sprite = (state = null, action) => {
  return state;
};

const glyphs = (state = null, action) => {
  return state;
};

const name = (state = '', action) => {
  return state;
};

const metadata = (state = {}, action) => {
  return state;
};

const bearing = (state = 0, action) => {
  return state;
};

const pitch = (state = 0, action) => {
  return state;
};

const created = (state = '', action) => {
  return state;
};

const id = (state = '', action) => {
  return id;
};

const owner = (state = '', action) => {
  return state;
};

const layersApp = combineReducers({
  layers,
  center,
  sources,
  version,
  sprite,
  glyphs,
  zoom,
  name,
  metadata,
  bearing,
  pitch,
  created,
  id,
  owner
});

// action creators
function removeLayer(layer) {
  return {
    type: 'REMOVE_LAYER',
    layer
  };
}

function toggleVisiblity(layer) {
  return {
    type: 'TOGGLE_LAYER_VISIBILITY',
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

fetch(context)
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
  , document.getElementById('layerlist'));
  map = apply('map', json);
  map.on('moveend', function(evt) {
    var view = evt.target.getView();
    var center = proj.toLonLat(view.getCenter(), view.getProjection());
    store.dispatch(setCenter(center));
  });
}).catch(function(ex) {
  console.log('parsing failed', ex)
});

let LayerList = ( {layers, onRemove, onToggle} ) => {
  var items = layers.map((layer, idx) => {
    return (<li key={idx}><input type='checkbox' onChange={onToggle.bind(this, layer)} checked={layer.layout ? layer.layout.visibility === 'visible' : true}/>{layer.id}<button onClick={onRemove.bind(this, layer)}>Remove</button></li>);
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
  },
  onToggle(layer) {
    dispatch(toggleVisiblity(layer));
  }
});

class MapSync extends React.Component {
  componentWillReceiveProps(nextProps) {
    map.getLayers().clear();
    apply(map, store.getState());
  }
  render() {
    return (<div/>);
  }
}

MapSync = connect(mapStateToProps)(MapSync);

LayerList = connect(mapStateToProps, mapDispatchToProps)(LayerList);
