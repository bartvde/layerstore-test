import {createStore, combineReducers} from 'redux';
import {Provider, connect} from 'react-redux';
import React from 'react';
import ReactDOM from 'react-dom';
import Map from 'ol/map';
import View from 'ol/view';
import TileLayer from 'ol/layer/tile';
import XYZ from 'ol/source/xyz';
import VectorLayer from 'ol/layer/vector';
import VectorTileLayer from 'ol/layer/vectortile';
import VectorSource from 'ol/source/vector';
import GeoJSONFormat from 'ol/format/geojson';
import Style from 'ol/style/style';
import CircleStyle from 'ol/style/circle';
import FillStyle from 'ol/style/fill';
import SelectInteraction from 'ol/interaction/select';
import LayerEditor from 'maputnik/src/components/layers/LayerEditor.jsx';
import proj from 'ol/proj';
import GlSpec from '@mapbox/mapbox-gl-style-spec/reference/latest.js'

import uuid from 'uuid';

import { apply, applyStyle } from 'ol-mapbox-style';

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
    case 'CHANGE_LAYER_STYLE':
      for (var i = 0, ii = state.length; i < ii; ++i) {
        if (state[i].id === action.layer.id) {
          index = i;
          break;
        }
      }
      return [
        ...state.slice(0, index),
        action.layer,
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

function changeStyle(layer) {
  return {
    type: 'CHANGE_LAYER_STYLE',
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
  const state = store.getState();
  ReactDOM.render(
    <Provider store={store}>
      <div>
        <LayerList />
        <LayerEditorContainer sources={{}} vectorLayers={{}} spec={GlSpec} />
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
    if (layer.type !== "background") {
      return (<li key={idx}><input type='checkbox' onChange={onToggle.bind(this, layer)} checked={layer.layout ? layer.layout.visibility === 'visible' : true}/>{layer.id}<button onClick={onRemove.bind(this, layer)}>Remove</button></li>);
    }
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
    //map.getLayers().clear();
    //apply(map, store.getState());
    map.getLayers().forEach(function(lyr) {
      if (lyr instanceof VectorTileLayer) {
        // TODO do not hard-code source id
        applyStyle(lyr, store.getState(), 'tegola-osm');
      }
    });
  }
  render() {
    return (<div/>);
  }
}

MapSync = connect(mapStateToProps)(MapSync);

const mapLayerEditorStateToProps = (state) => {
  return {
    layer: state.layers[0]
  };
}

const mapLayerEditorDispatchToProps = (dispatch) => ({
  onLayerChanged(layer) {
    dispatch(changeStyle(layer));
  }
});

const LayerEditorContainer = connect(mapLayerEditorStateToProps, mapLayerEditorDispatchToProps)(LayerEditor);

LayerList = connect(mapStateToProps, mapDispatchToProps)(LayerList);
