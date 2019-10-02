import React,{Component} from 'react';
import logo from './logo.svg';
import Clarifai from 'clarifai';
import Particles from 'react-particles-js';
import './App.css';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Register from './components/Register/Register';
import SignIn from './components/SignIn/SignIn';

import 'tachyons';


const app=new Clarifai.App({
  apiKey:'cf9b1eec5db540f48dea6edff3b1ce4a'
})

const Options={

    particles: {
      number:{
        value:50,
        density:{
          enable:true,
          value_area:700
        }
      }
      }
    }



class App extends Component {
constructor(){
  super();
  this.state={
    input:'',
    imageUrl:'',
    box:{},
    route:'signin',
    isSignedIn:false,
    user:{
      id:'',
      name:'',
      email:'',
      entries:0,
      joined:''
    }
  }
}

loadUser=(data)=>{
  this.setState({
    user:{
      id:data.id,
      name:data.name,
      email:data.email,
      entries:data.entries,
      joined:data.joined
    }
  })
}

/*componentDidMount(){
  fetch('http://localhost:3000/')
  .then(response=>response.json())
  .then(data=>console.log(data))
}*/


calculateFaceRecognition=(data)=>{
const facedata=data.outputs[0].data.regions[0].region_info.bounding_box
const image=document.getElementById('inputimage');
const width=Number(image.width);
const height=Number(image.height);
return {
  leftCol:facedata.left_col*width,
  topRow:facedata.top_row*height,
  rightCol:width-(facedata.right_col*width),
  bottomRow:height-(facedata.bottom_row*height),
}
}


displayFaceBox=(box)=>{
  console.log(box);
  this.setState({box:box})
}

onInputChange=(e)=>{
  this.setState({input:e.target.value})
  console.log(e.target.value);
}

onSubmitChange=()=>{
  this.setState({imageUrl:this.state.input})
  console.log('clicked');
  app.models.predict(Clarifai.FACE_DETECT_MODEL,this.state.input)
  .then(response=>{

    if(response){
      fetch('http://localhost:3000/image',{
        method:'put',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
       id:this.state.user.id
        })
      })
      .then(response=>response.json())
      .then(count=>{
        this.setState(Object.assign(this.state.user,{entries:count}))
      })
    }
    this.displayFaceBox(this.calculateFaceRecognition(response))
  })
  .catch(err=>console.log(err))
}

onRouteChange=(route)=>{
  if(route==='signout'){
    this.setState({isSignedIn:false})
  }else if(route==='home'){
    this.setState({isSignedIn:true})
  }
  this.setState({route:route})
}


  render(){
  return (
    <div className="App">
      <Particles className="particles"
           params={Options}
         />
       <Navigation onRouteChange={this.onRouteChange} isSignedIn={this.state.isSignedIn}/>
       {this.state.route==='home'?
           <div>
                <Logo/>
                   <Rank
                  name={this.state.user.name}
                  entries={this.state.user.entries}


                     />
               <ImageLinkForm onInputChange={this.onInputChange} onSubmitChange={this.onSubmitChange}/>
            <FaceRecognition box={this.state.box} imageUrl={this.state.imageUrl}/>

              </div>
              :(
  this.state.route==='signin'?
  <SignIn  loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
   :
  <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
)
}

  </div>
  );}
}

export default App;
