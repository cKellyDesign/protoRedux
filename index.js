import React from 'react';
import ReactDOM from 'react-dom';
import { Provider, connect } from 'react-redux';
import { createStore, combineReducers } from 'redux';


// ************* DEFINE INITIAL STATE / DATA *************
// this is data that's actually used for rendering
const LayerData = [
	{
		name: "A",
		url: "google.com",
		color: "red",
		visible: false
	},{
		name: "B",
		url: "gmail.com",
		color: "steelblue",
		visible: false
	},{
		name: "C",
		url: "ona.io",
		color: "orange",
		visible: false,
	}
];

// this is the actual object to be passed into store
const initialState = {
	activeLayer: 'A',
	switchLayer: LayerData
}

// define action types
const SWITCH_TO_LAYER = 'SWITCH_TO_LAYER';
const TOGGLE_LAYER = 'TOGGLE_LAYER';
const UPDATE_ACTIVE_LAYER = 'UPDATE_ACTIVE_LAYER';

// action creator functions
function switchToLayer (name) {
	return { type: SWITCH_TO_LAYER, name }
}
function toggleLayer (name) {
	return { type: TOGGLE_LAYER, name }
}

// REDUCER - this is what actually updates the state
const switchLayer = (state = [], action) => {
	switch (action.type) {
		case 'SWITCH_TO_LAYER':
			return state.map(l =>
				(l.name === action.name)
					? {...l, visible: true}
					: {...l, visible: false}
			);
		case 'TOGGLE_LAYER': {
			return state.map(l =>
				(l.id === action.id)
					? {...l, visible: !l.visible}
					: l
				);
		}
		default:
			return state;
	}
}

const activeLayer = (state = '', action) => {
	switch (action.type) {
		case 'SWITCH_TO_LAYER': 
			return action.name;
		break;
		case 'TOGGLE_LAYER':
			return '';
		break;
		default:
			return state;
	}
	return state;
}

const reducer = combineReducers({activeLayer, switchLayer});
// initiate the store which will control the universal state
window.store = createStore(reducer, initialState);



// ************* DEFINE (REACT) PRESENTATIONAL COMPONENTS *************
class Layer extends React.Component {
	constructor(props) {
		super(props);
		this.clickHandle = this.clickHandle.bind(this);
		this.state = this.props.data;
	}

	clickHandle(e) {
		e.preventDefault()
		this.props.layerHandle(this.state);
	}

	render() {
		if (!this.state) return <li>"null"</li>;
		const { url, name, color } = this.state;
		return (
			<li>
				<a href={url} style={{color:color}} onClick={this.clickHandle}>{name}</a>
			</li>
		)
	}
}

class Layers extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		const { layerHandle, layers } = this.props;
		const lis = layers.map(function(layer) { 
			return <Layer key={layer.name} layerHandle={layerHandle} data={layer} />
		});

		return (
			<ul>{lis}</ul>
		);
	}
}

class Mapp extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		if (typeof this.props.layer === 'undefined') return <div/>;

		const style = { backgroundColor:this.props.layer.color };
		return <div style={style}>{this.props.layer.name}</div>;
	}
}



// ************* DEFINE (REDUX) CONTAINER COMPONENTS *************
const mapStateToProps = state => {
	return {
		layers: [...state.switchLayer],
		layer: state.switchLayer.find(l => state.activeLayer === l.name)
	};
}

const mapDispatchToProps = dispatch => {
	return {
		layerHandle: e => {
			const action = (store.getState()).activeLayer === e.name
				? toggleLayer(e.name)
				: switchToLayer(e.name);
			dispatch(action);
		}
	}
}

const LayersContainer = connect(mapStateToProps, mapDispatchToProps)(Layers);
const MapContainer = connect(mapStateToProps)(Mapp)



// ************* DEFINE ROOT APP COMPONENT *************
class Host extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div>
				<h1>Hello Host</h1>
				{this.props.children}
			</div>
		);
	}
}



// ************* RENDER ROOT COMPONENT AS CHILD OF PROVIDER *************
ReactDOM.render(
	(<Provider store={store}>
		<Host>
			<LayersContainer />
			<MapContainer />
		</Host>
	</Provider>),
	document.getElementById('root')
);