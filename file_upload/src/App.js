import React from 'react';
import './App.css';
import { Link, Switch, Route, BrowserRouter } from 'react-router-dom';
import ImageUpload from './ImageUpload.js';
import Login_Reg from './Login_Reg.js';
import Logout from './Logout.js';
import Profile from './Profile.js';
import Home from './Home.js';
import Logo from './camera-retro-solid.svg';

const NavBar = () =>
	<nav>
		<ul>
			<div>
				<Link to='/'><img src={Logo}/></Link>
				<li className="logo"><Link to='/'>Instaspam</Link></li>
			</div>
			<div>
				<li><Link to='/upload'>Upload<span id="upload-image"> Image</span></Link></li>
				<li><Link to='/profile'>Profile</Link></li>
				<li><Link to='/logout'>Sign Out</Link></li>
			</div>
		</ul>
	</nav>

const Main = () =>
	<main>
		<Switch>
			<Route exact path="/profile" component={Profile} />
			<Route exact path="/Upload" component={ImageUpload} />
			<Route exact path="/Login" component={Login_Reg} />
			<Route exact path="/Logout" component={Logout} />
			<Route path="/*" component={Home} />
		</Switch>
	</main>

class App extends React.Component {

	render() {
		return <BrowserRouter>
				<NavBar />
				<Main />
			</BrowserRouter>
	}
}

export default App;
