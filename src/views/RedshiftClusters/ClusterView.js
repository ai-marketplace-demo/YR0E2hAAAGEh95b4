import React, {useState, useEffect} from "react";
import {Row, Col, Container, Badge, Tabs, Tab, Spinner, DropdownButton, Dropdown} from "react-bootstrap"
import {useParams, useLocation, useHistory, Link, Switch, Route} from "react-router-dom";
import useClient from "../../api/client";
import getCluster from "../../api/RedshiftCluster/getCluster";
import ClusterDetails from "./ClusterDetails";
import dayjs from "dayjs"
import relativeTime from 'dayjs/plugin/relativeTime';
import {Else, If, Then} from "react-if";
import {toast} from "react-toastify";
import * as Icon from "react-bootstrap-icons";
import styled from "styled-components";
import RedshiftClusterDatasets from "./ClusterDatasets/RedshiftClusterDatasets";
import Datashopper from "./ClusterDatasets/Datashopper";
import { faPlayCircle, faPauseCircle,
    faTrashAlt} from "@fortawesome/free-solid-svg-icons";
import { faAws } from "@fortawesome/free-brands-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import resumeRedshiftCluster from "../../api/RedshiftCluster/resumeCluster";
import pauseRedshiftCluster from "../../api/RedshiftCluster/pauseCluster";
import deleteRedshiftCluster from "../../api/RedshiftCluster/deleteCluster";
import getClusterConsoleAccess from "../../api/RedshiftCluster/getClusterConsoleAccess";
import ClusterCredentials from "./ClusterCredentials";


dayjs.extend(relativeTime);

const FullScreen = styled.div`
height:100vh;
a:link, a:visited{
    text-decoration:none;
}
a{
 outline: 0;
}
`;

const RedshiftClusterView  = (props)=> {

    let client = useClient();
    let params = useParams();
    let history = useHistory();
    let [cluster, setCluster] = useState();
    let [ready, setReady] = useState(false);
    let [consoleUrl,setConsoleUrl]=useState();
    let [isLoadingConsoleUrl,setIsLoadingConsoleUrl] = useState(false);
    let [interval, setInterval] = useState(undefined);
    let [timeout, setTimeout] = useState(undefined);
    let [isLoadingCluster, setIsLoadingCluster] = useState(false);
    let [isStartingCluster, setIsStartingCluster] = useState(false);
    let [isStoppingCluster, setIsStoppingCluster] = useState(false);
    let [isDeletingCluster, setIsDeletingCluster] = useState(false);

    let [key, setKey] = useState('clusterDetails');

    useEffect(() => {
        if (client) {
            client
                .query(getCluster(params.uri))
                .then((response) => {
                    setCluster({...response.data.getRedshiftCluster});
                    if (history.location.pathname === `/redshiftcluster/${params.uri}/redshiftcreds`){
                        setKey('clusterCreds')
                    }
                    else if (history.location.pathname === `/redshiftcluster/${params.uri}/datasets`){
                        setKey('datasets')
                    }
                    setReady(true);
                    console.log("cluster = ", cluster);
                }).catch((e) => {
                toast(`Could not retrieve cluster details , received ${e.message}`)
            });
        }

    }, [client]);

    const getReshiftCluster = () => {
        client
            .query(getCluster(params.uri))
            .then((response) => {
                setCluster({...response.data.getRedshiftCluster});
                setReady(true);
                console.log("cluster = ", cluster);
            }).catch((e) => {
                toast(`Could not retrieve cluster details , received ${e.message}`)
            });
    };

    const startCluster = async ()=>{
        setIsStartingCluster(true);
        const response = await client.mutate(resumeRedshiftCluster(cluster.clusterUri));
        if (response.errors){
            toast.error(`Could not Resume Cluster ${cluster.name}, ${response.errors[0].message}`,{hideProgressBar:true})
        }
        else{
            toast.success(`Cluster ${cluster.name} is resuming`);
        }
        setIsStartingCluster(false);
    };

    const stopCluster = async ()=>{
        setIsStoppingCluster(true);
        const response = await client.mutate(pauseRedshiftCluster(cluster.clusterUri));
        if (response.errors){
            toast.error(`Could not Pause Cluster, ${response.errors[0].message}`,{hideProgressBar:true})
        }
        else{
            toast.success(`Cluster ${cluster.name} is pausing`);
        }
        setIsStoppingCluster(false);
    };

    const deleteCluster = async ()=>{
        setIsDeletingCluster(true);
        const response = await client.mutate(deleteRedshiftCluster(cluster.clusterUri));
        if (response.errors){
            toast.error(`Could not Delete cluster, ${response.errors[0].message}`,{hideProgressBar:true})
        }
        else{
            toast(`Deleting Cluster ${cluster.name}`);
            setIsDeletingCluster(false);
            history.push(`/redshiftclusters`);
        }
    };

    const generateRedirectUrl = async () => {
        toast(`Opening AWS console in new tab`);
        client.query(
            getClusterConsoleAccess(cluster.clusterUri))
            .then((response) => {
                window.open(response.data.getRedshiftClusterConsoleAccess, '_blank');
            })
            .catch((e) => {
                toast(`Could not retrieve URL , received ${e.message}`)
            });
    };

    const handleActionButtons = (key) => {
        if(key === 'consoleAccess') {
            generateRedirectUrl();
        }
        else if(key === 'resume'){
            startCluster().then(getReshiftCluster());
        }
        else if(key === 'pause'){
            stopCluster().then(getReshiftCluster());
        }
        else if(key === 'delete'){
            deleteCluster();

        }
    };

    const handleSelect = (key) => {
        if(key === 'datasets') {
            history.push(`/redshiftcluster/${cluster.clusterUri}/datasets`);
            setKey('datasets');
        }
        else if (key === 'clusterCreds') {
            history.push(`/redshiftcluster/${cluster.clusterUri}/redshiftcreds`);
            setKey('clusterCreds');
        }
        else{
            history.push(`/redshiftcluster/${cluster.clusterUri}`);
            setKey('clusterDetails');
        }
    };

    if (!ready) {
        return <Col>
            <Spinner variant={"primary"} animation="border" role="status">
                <span className="sr-only">Loading...</span>
            </Spinner>
        </Col>

    }

    return <FullScreen>
        <Container>
            <Row className={`mb-1 pt-4 pb-3 border-top border-bottom`}>
                <Col className={`pt-2`} xs={1}>
                    <Link
                        to={{
                            pathname: `/redshiftclusters`
                        }}
                        style={{color: 'black'}}>
                        <Icon.ChevronLeft size={32}/>
                    </Link>
                </Col>
                <Col xs={5} className={`border-right`}>
                    <h3><Icon.Server size={22}/> Redshift Cluster <b className={`text-primary`}>{cluster.label}</b></h3>
                </Col>
                <Col xs={2} className={`pt-2 border-right`}>
                    Role for Cluster : <b className={`text-primary`}>{cluster.userRoleForCluster}</b>

                </Col>
                <Col xs={2} className={`pt-2`}>
                    {cluster.region}
                </Col>
            </Row>
            <Row>
                <Col className={`mt-4`} xs={12}>
                    <If condition={cluster.userRoleForCluster === 'Creator' || cluster.userRoleForCluster === 'Admin'}>
                        <Then>
                            <Row>
                                <Col xs={12}>
                                    <DropdownButton id="dropdown-basic-button" className="float-right" variant={'outline-primary'} title="Actions">
                                        <Dropdown.Item eventKey="consoleAccess" onSelect={(k) => handleActionButtons(k)}>
                                            <FontAwesomeIcon icon={faAws} style={{ color: '#545b64', marginRight: '5px'}} size="sm"/>
                                            Console
                                        </Dropdown.Item>
                                        <Dropdown.Item eventKey="resume" onSelect={(k) => handleActionButtons(k)}>
                                            <FontAwesomeIcon icon={faPlayCircle} style={{ color: '#545b64', marginRight: '5px'}} size="sm"/>
                                            Resume
                                        </Dropdown.Item>
                                        <Dropdown.Item eventKey="pause" onSelect={(k) => handleActionButtons(k)}>
                                            <FontAwesomeIcon icon={faPauseCircle} style={{ color: '#545b64', marginRight: '5px'}} size="sm"/>
                                            Pause
                                        </Dropdown.Item>
                                        <Dropdown.Item eventKey="delete" onSelect={(k) => handleActionButtons(k)}>
                                            <FontAwesomeIcon icon={faTrashAlt} style={{ color: '#545b64', marginRight: '5px'}} size="sm"/>
                                            Delete
                                        </Dropdown.Item>
                                    </DropdownButton>
                                </Col>
                            </Row>
                            <Tabs
                                activeKey={key}
                                onSelect={(k) => handleSelect(k)}
                            >
                                <Tab eventKey="clusterDetails" title="Cluster Details">
                                    <ClusterDetails cluster={cluster}/>
                                </Tab>
                                <Tab eventKey="datasets" title="Link Datasets">
                                    <Switch>
                                        <Route path={`/redshiftcluster/:uri/datasets`}>
                                            <RedshiftClusterDatasets cluster={cluster}/>
                                        </Route>
                                        <Route path={`/redshiftcluster/:uri/addDataset`}>
                                            <Datashopper cluster={cluster}/>
                                        </Route>
                                    </Switch>
                                </Tab>
                                <Tab eventKey="clusterCreds" title="Cluster Credentials">
                                    <Switch>
                                        <Route path={`/redshiftcluster/:uri/redshiftcreds`}>
                                            <ClusterCredentials cluster={cluster}/>
                                        </Route>
                                    </Switch>
                                </Tab>
                            </Tabs>
                        </Then>
                        <Else>
                            <Tabs
                                activeKey={key}
                                onSelect={(k) => setKey(k)}
                            >
                                <Tab eventKey="clusterDetails" title="Cluster Details">
                                    <ClusterDetails cluster={cluster}/>
                                </Tab>
                            </Tabs>
                        </Else>
                    </If>
                </Col>
            </Row>
        </Container>
    </FullScreen>;
};
export default RedshiftClusterView;
