/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/jsx-no-undef */
import React, {Component} from 'react';
import {
  Container,
  Header,
  Content,
  Form,
  Item,
  Picker,
  Icon,
} from 'native-base';

export default class SelectData extends Component {
  render() {
    return (
      <Container>
        <Content>
          <Form>
            <Item picker>
              <Picker
                mode="dropdown"
                iosIcon={<Icon name="arrow-down" />}
                style={{width: undefined}}
                placeholder={this.props.filedName ? this.props.filedName : ''}
                placeholderStyle={{color: '#bfc6ea'}}
                placeholderIconColor="#007aff"
                selectedValue={this.props.selectedValue}
                onValueChange={this.props.onValueChange}>
                {this.props.selects.map(el => (
                  <Picker.Item label={el} value={el} />
                ))}
              </Picker>
            </Item>
          </Form>
        </Content>
      </Container>
    );
  }
}
