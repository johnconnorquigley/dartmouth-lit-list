import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {AzureInstance, AzureLoginView} from 'react-native-azure-ad-2';

var credentials = {
  client_id: 'f1aeeadd-f89c-43e9-a71e-b3845370643d',
  client_secret: 'bnzhRTNIB1035ybjAT4**;#',
  scope: 'User.ReadBasic.All Mail.Read' //access scope for login - see http://bit.ly/2gtQe9W for more info
};

//create a component for Azure Authentication
export default class azureAuth extends React.Component {
	constructor(props){
		super(props);

    //instantiate azure objects with your azure credentials
		this.azureInstance = new AzureInstance(credentials);
    console.log(this.azureInstance);

    //bind the login success function
		this._onLoginSuccess = this._onLoginSuccess.bind(this);
	}

  // function to be called after login is successful
	_onLoginSuccess(){
		this.azureInstance.getUserInfo().then(result => {
			console.log("Success" + result);
		}).catch(err => {
			console.log(err);
		})
	}

  // pass the azureInstance and Login Success function to the AzureLoginView that will display
  // the authentication screen
    render() {
        return (
            <AzureLoginView
            	azureInstance={this.azureInstance}
            	loadingMessage="Requesting access token"
            	onSuccess={this._onLoginSuccess}
            />
        );
    }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
