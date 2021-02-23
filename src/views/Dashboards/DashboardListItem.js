import React, { useState, useEffect } from 'react';
import {
    Container, Row, Col, Badge, ListGroupItem, ListGroup, Dropdown, Table, Card
} from 'react-bootstrap';
import * as Icon from 'react-bootstrap-icons';
import styled from 'styled-components';
import { Sparklines, SparklinesBars } from 'react-sparklines';
import {
    BrowserRouter, Route, Link, Switch
} from 'react-router-dom';
import Avatar from 'react-avatar';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import UserProfileLink from '../Profile/UserProfileLink';
import ActionButton from '../../components/ActionButton/ActionButton';
import Tag from '../../components/Tag/Tag';
import Zoom from '../../components/Zoomer/Zoom';
import BasicCard from '../../components/Card/BasicCard';

dayjs.extend(relativeTime);

const Styled = styled.div`
transition: transform 0.3s ease-in-out;
&:hover{
  transform: translateY(-5px);
  box-shadow: 0px 3px 2px lightgrey;
}
height:15rem;
margin-top: 7px;
padding: 1em;
border : 1px solid gainsboro;
border-radius: 8px;

a{
  color :black;
  outline: 0;
}
a:hover, a:link, a:visited{
  text-decoration:none;
  color :black;
}
}
`;


const Header = (props) => (
    <Link to={`/dashboardadmin/${props.dashboard.dashboardUri}/overview`}>
        <div><b>{props.dashboard.label}</b></div>
    </Link>
);


const Body = (props) => (
    <Row className={'mt-3'}>
        <Col xs={4}><Icon.PersonCheck></Icon.PersonCheck></Col>
        <Col xs={8}>
            <Badge className={'pb-1'} variant={'info'} pill>{props.dashboard.userRoleForDashboard} </Badge>
        </Col>
        <Col xs={4}><Icon.Person></Icon.Person></Col>
        <Col xs={8}>
            <small>{props.dashboard.owner} </small>
        </Col>
        <Col xs={4}><Icon.People></Icon.People></Col>
        <Col xs={8}>
            <small>{props.dashboard.SamlGroupName} </small>
        </Col>
        <Col xs={4}><Icon.House></Icon.House></Col>
        <Col xs={8}>
            <small> {props.dashboard.organization.label}</small>
        </Col>
        <Col xs={4}><Icon.Cloud></Icon.Cloud></Col>
        <Col xs={8}>
            <small>{props.dashboard.environment.label}({props.dashboard.environment.AwsAccountId}:{props.dashboard.environment.region}) </small>
        </Col>

    </Row>
);


const DashboardListItem = (props) => {
    const header = <Header {...props} />;
    const body = <Body {...props} />;
    return (
        <BasicCard
            header={header}
            body={body}
            label={props.dashboard.label}
            owner={props.dashboard.owner}
            created={props.dashboard.created}
            tags={props.dashboard.tags || []}
            description={props.dashboard.description}
        />
    );

    return (
        <Styled>
            <Row className={''}>
                <Col xs={8}>
                    <Link to={`/dashboardadmin/${props.dashboard.dashboardUri}/overview`}>
                        <p>
                            <Avatar className={'mr-1'} size={32} round name={props.dashboard.label} /> <b className={'text-capitalize'}>{props.dashboard.label}</b>
                        </p>
                    </Link>
                </Col>
                <Col xs={12}>
                    <b>{props.dashboard.description.slice(0, 25)}</b>
                </Col>
            </Row>

            <Row className={'mt-1'}>
                <Col xs={4}><Icon.PersonCheck></Icon.PersonCheck></Col>
                <Col xs={8}>
                    <Badge variant={'primary'} pill>{props.dashboard.userRoleForDashboard} </Badge>
                </Col>
                <Col xs={4}><Icon.Person></Icon.Person></Col>
                <Col xs={8}>
                    <small>{props.dashboard.owner} </small>
                </Col>
                <Col xs={4}><Icon.People></Icon.People></Col>
                <Col xs={8}>
                    <small>{props.dashboard.SamlGroupName} </small>
                </Col>
                <Col xs={4}><Icon.House></Icon.House></Col>
                <Col xs={8}>
                    <small> {props.dashboard.organization.label}</small>
                </Col>
                <Col xs={4}><Icon.Cloud></Icon.Cloud></Col>
                <Col xs={8}>
                    <small>{props.dashboard.environment.label}({props.dashboard.environment.AwsAccountId}:{props.dashboard.environment.region}) </small>
                </Col>

            </Row>
            <Row>
                <Col xs={6}>
                    <small>Created by <UserProfileLink username={props.dashboard.owner} /> </small>
                </Col>
                <Col xs={6}>
                    <small>
                        {dayjs(props.dashboard.created).fromNow()}
                    </small>
                </Col>
            </Row>

            <Row className={'mt-2 border-top'}>
                {
                    props.dashboard.tags.map((tag) => (
                        <Col className={'ml-1 mt-1 pr-2'} xs={3}>
                            <Badge className={'ml-1'} variant={'secondary'}>{tag}</Badge>
                        </Col>
                    ))
                }
            </Row>
            <Row>
                <div style={{ height: '200px' }} />
            </Row>
        </Styled>
    );
};

export default DashboardListItem;
