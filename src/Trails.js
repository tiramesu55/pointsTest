import React from 'react';
import {Component} from 'react';

// eslint-disable-next-line no-unused-vars
import {Platform, StyleSheet, View} from 'react-native';
import BackgroundGeolocation, {
  Location,
  MotionChangeEvent,
  ProviderChangeEvent,
  HttpEvent,
  HeartbeatEvent,
  MotionActivityEvent,
} from 'react-native-background-geolocation';
import DeviceInfo from 'react-native-device-info';
import {
  Container,
  Header,
  Content,
  Footer,
  Left,
  Body,
  Right,
  Card,
  CardItem,
  Text,
  H1,
  Switch,
  Button,
  Icon,
  Title,
  StyleProvider,
  Input,
  Label,
  Item,
} from 'native-base';
import SelectsData from './components/select';
import {Col, Row, Grid} from 'react-native-easy-grid';

const TRACKER_HOST =
  'https://us-central1-mountain-ace.cloudfunctions.net/locationsTrails';
export default class Trails extends Component {
  static navigationOptions = {title: 'Trails'};
  constructor(props) {
    super(props);
    this.navigation = this.props.navigation;
    this.state = {
      enabled: false,
      isMoving: false,
      events: [],
      mountains: [],
      trails: [],
      selectedmountain: '',
      selectedtrail: '',
      addMountain: '',
      addTrail: '',
    };
  }
  addEvent(name, date, object) {
    let event = {
      key: this.eventId++,
      name: name,
      timestamp: date.toLocaleTimeString(),
      json: JSON.stringify(object, null, 2),
    };
    /*this.setState({
      events: [...this.state.events, event],
    });*/
  }

  onHttp(response) {
    console.log('[event] http: ', response);
    this.addEvent('http', new Date(), response);
  }
  onHeartbeat(event) {
    console.log('[event] heartbeat: ', event);
    this.addEvent('heartbeat', new Date(), event);
  }
  onToggleEnabled() {
    const enabled = !this.state.enabled;
    this.setState({
      enabled: enabled,
      isMoving: false,
    });
    if (enabled) {
      BackgroundGeolocation.start();
    } else {
      BackgroundGeolocation.stop();
    }
  }
  LocationActivate = () => {
    BackgroundGeolocation.onHttp(this.onHttp.bind(this));
    BackgroundGeolocation.onHeartbeat(this.onHeartbeat.bind(this));
    BackgroundGeolocation.onConnectivityChange(event => {
      console.log('[event] connectivityChange: ', event);
      this.addEvent('connectivity Change', new Date(), event);
    });
    const id = DeviceInfo.getDeviceId();
    BackgroundGeolocation.ready(
      {
        // preventSuspend: true,  //play with that.  It may not be necessary
        distanceFilter: 10,
        stopOnTerminate: false,
        //startOnBoot: true,
        desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
        stopTimeout: 5, //wait 5 min before stopping if still
        maxDaysToPersist: 1,
        foregroundService: true,
        heartbeatInterval: 60,
        url: TRACKER_HOST,
        params: {
          // Required for tracker.transistorsoft.com
          device: {
            uuid: id,
            model: DeviceInfo.getModel(),
            platform: DeviceInfo.getSystemName(),
            manufacturer: 'Apple',
            version: '1',
            framework: 'woi',
            mountain: this.state.selectedmountain,
            trail: this.state.selectedtrail,
          },
        },
        autoSync: true,
        debug: false, //true,
        logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
        logMaxDays: 1,
      },
      state => {
        console.log('- Configure success: ', state);
        this.setState({
          enabled: state.enabled,
          isMoving: state.isMoving,
        });
      },
    );
  };
  async componentDidMount() {
    await fetch(
      'https://us-central1-mountain-ace.cloudfunctions.net/mountainsData',
    )
      .then(response => response.json())
      .then(responseJson => {
        console.log(responseJson);
        this.setState({
          mountains: responseJson.data,
          selectedmountain:
            responseJson.data.length > 0 ? responseJson.data[0].mountain : '',
          selectedtrail:
            responseJson.data.length > 0
              ? responseJson.data[0].trails.length > 0
                ? responseJson.data[0].trails[0]
                : ''
              : '',
        });
      })
      .catch(error => {
        console.error(error);
      });
  }
  mountainChange = value => {
    this.setState({selectedmountain: value});
  };
  trailChange = value => {
    this.setState({selectedtrail: value});
  };
  onMountainChange = e => {
    this.setState({addMountain: e});
  };
  onTrailChange = e => {
    this.setState({addTrail: e});
  };
  addMountainReq = async () => {
    console.log(this.state);
    if (
      this.state.mountains.filter(el => el.mountains === this.state.addMountain)
        .length === 0
    ) {
      await fetch(
        'https://us-central1-mountain-ace.cloudfunctions.net/addMountain',
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mountain: this.state.addMountain,
          }),
        },
      )
        .then(response => response.json())
        .then(responseJson => {
          console.log(responseJson);
          this.setState({
            mountains: responseJson.data,
            selectedmountain: '',
          });
        })
        .catch(error => {
          console.error(error);
        });
    } else {
      console.log('Nothing(((');
    }
  };
  addTrailReq = async () => {
    if (
      this.state.mountains
        .filter(el => el.mountains === this.state.addMountain)
        .filter(el => el.trails.indexOf(this.state.addTrail) !== -1).length ===
      0
    ) {
      await fetch(
        'https://us-central1-mountain-ace.cloudfunctions.net/addTrail',
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mountain: this.state.selectedmountain,
            trail: this.state.addTrail,
          }),
        },
      )
        .then(response => response.json())
        .then(responseJson => {
          console.log(responseJson);
          this.setState({
            mountains: responseJson.data,
            selectedtrail: '',
          });
        })
        .catch(error => {
          console.error(error);
        });
    }
  };
  goHomePress = () => {
    this.onToggleEnabled();
    this.navigation.navigate('Home');
  };
  render() {
    return (
      <Container>
        <SelectsData
          filedName="Mountains"
          selectedValue={this.state.selectedmountain}
          onValueChange={this.mountainChange}
          selects={this.state.mountains.map(el => el.mountain)}
        />

        <Item stackedLabel>
          <Label>Mountain</Label>
          <Input
            onChangeText={this.onMountainChange}
            value={this.state.addMountain}
          />
        </Item>

        <Card>
          <Button block info onPress={this.addMountainReq}>
            <Text> Add Mountain </Text>
          </Button>
        </Card>
        {this.state.selectedmountain ? (
          <>
            <SelectsData
              filedName="Trails"
              selectedValue={this.state.selectedtrail}
              onValueChange={this.trailChange}
              selects={
                this.state.mountains.filter(
                  el => el.mountain === this.state.selectedmountain,
                )[0].trails
              }
            />
            <Item stackedLabel>
              <Label>Trail</Label>
              <Input
                onChangeText={this.onTrailChange}
                value={this.state.addTrail}
              />
            </Item>

            <Card>
              <Button block info onPress={this.addTrailReq}>
                <Text> Add Trail </Text>
              </Button>
            </Card>
          </>
        ) : null}
        <Card>
          <Button block info onPress={this.LocationActivate}>
            <Text> Activate </Text>
          </Button>
        </Card>
        <Card>
          <Switch
            onValueChange={() => this.onToggleEnabled()}
            value={this.state.enabled}
          />
          <Text> Activate Trails </Text>
        </Card>
        <Card>
          <Button block info onPress={this.goHomePress}>
            <Text> Go To Home </Text>
          </Button>
        </Card>
      </Container>
    );
  }
}
const styles = StyleSheet.create({
  header: {
    backgroundColor: '#fedd1e',
  },
  title: {
    color: '#000',
  },
  body: {
    width: '100%',
    justifyContent: 'center',
    backgroundColor: '#272727',
  },
  h1: {
    color: '#fff',
    marginBottom: 20,
  },
  p: {
    fontSize: 12,
    marginBottom: 5,
  },
  url: {
    fontSize: 12,
    textAlign: 'center',
  },
  button: {
    marginBottom: 10,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  footer: {
    backgroundColor: 'transparent',
    height: 215,
  },
  userInfo: {
    padding: 10,
  },
});
