import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import {
    Container, Row, Col, Form, Button, Spinner
} from 'react-bootstrap';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { If, Then } from 'react-if';
import * as AiIcon from 'react-icons/ai';
import { useHistory, useParams } from 'react-router';
import Editor from '@monaco-editor/react';
import getDatasetQualityRule from '../../../api/DatasetQualityRule/getDatasetQualityRule';
import updateDatasetQualityRule from '../../../api/DatasetQualityRule/updateDatasetQualityRule';
import createDatasetQualityRule from '../../../api/DatasetQualityRule/createDatasetQualityRule';
import useClient from '../../../api/client';

const Background = styled.div`
margin-top: 3%;
margin-right: 5px;
z-index: 10;
border-radius: 0px;
background-color: white;
border : 1px solid lightgrey;
border-left:  4px solid #24a8c9;
overflow-y:auto;
overflow-x: hidden;

box-shadow: 0px 1px 2px 2px whitesmoke;
padding: 16px;
.form-group {
    margin-bottom: 1.6em;
  }
.error {
    border: 2px solid #FF6565;
  }
.error-message {
color: #FF6565;
padding: .5em .2em;
height: 1em;
position: absolute;
font-size: .8em;
}
.editor {
fontFamily:'Courier';
overflowY:'auto';
color: #FF6565;
}
`;
const UpdateDatasetQualityRule = (props) => {
    const client = useClient();
    const { ruleUri } = props;
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        label: '',
        description: '',
        query: ''
    });
    const [isEditorReady, setIsEditorReady] = useState(false);
    const valueGetter = useRef();
    function handleEditorDidMount(_valueGetter) {
        setIsEditorReady(true);
        valueGetter.current = _valueGetter;
    }

    const fetchRule = async () => {
        const response = await client.query(getDatasetQualityRule(ruleUri));
        if (!response.errors) {
            setFormData(response.data.getDatasetQualityRule);
        } else {
            toast(`Could not retrieve rule , received ${response.errors[0].message}`);
        }
    };

    const validationSchema = Yup.object().shape({
        label: Yup.string()
            .min(1, '*Query name must have at least 1 character')
            .max(63, "*Query name can't be longer than 63 characters")
            .required('*Query name is required')
    });


    const submitForm = async (formData) => {
        const response = await client.mutate(updateDatasetQualityRule({
            ruleUri,
            input: {
                query: valueGetter.current() || 'SELECT 1;',
                description: formData.description,
                label: formData.label
            }
        }));
        if (!response.errors) {
            toast(`Updated rule ${ruleUri}`);
            props.close();
        } else {
            toast(`Could not update data quality rule, received ${response.errors[0].message}`);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    useEffect(() => {
        if (client) {
            fetchRule();
        }
    }, [client]);


    return (
        <Container>
            <Row>
                <Col xs={1}>
                    <AiIcon.AiOutlineFileSearch size={32} />
                </Col>
                <Col xs={11}>
                    <h4>Edit Data Quality Rule</h4>
                </Col>
                <Col xs={12}>
                    <If condition={submitting}>
                        <Then>
                            <Spinner variant={'primary'} animation={'border'} />
                        </Then>
                    </If>
                </Col>
            </Row>
            <Background>
                <Formik
                    enableReinitialize
                    initialValues={formData}
                    validationSchema={validationSchema}
                    onSubmit={(formData, { setSubmitting, resetForm }) => {
                        submitForm(formData);
                    }}
                >
                    {/* Callback function containing Formik state and helpers that handle common form actions */}
                    {({
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleBlur,
                        handleSubmit,
                        isSubmitting,
                        setFieldValue
                    }) => (

                        <Form onSubmit={handleSubmit} className="mx-auto">
                            {console.log(values)}
                            <Form.Group controlId="label">
                                <Form.Label><b>Name</b></Form.Label>
                                <Form.Control
                                    type="text"
                                    name="label"
                                    placeholder="Rule name"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.label}
                                    className={touched.label && errors.label ? 'error' : null}
                                />
                                {touched.label && errors.label ? (
                                    <div className="error-message">{errors.label}</div>
                                ) : null}
                            </Form.Group>

                            <Form.Group controlId="description">
                                <Form.Label><b>Description</b></Form.Label>
                                <Form.Control
                                    as="textarea"
                                    name="description"
                                    placeholder="1"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.description}
                                    className={touched.description && errors.description ? 'error' : null}
                                />
                            </Form.Group>
                            <Editor
                                value={formData.query || 'select * from T'}
                                options={{ minimap: { enabled: false } }}
                                theme={'hc-black'}
                                inDiffEditor={false}
                                height="19rem"
                                editorDidMount={handleEditorDidMount}
                                language="sql"
                            />
                            {touched.query && errors.query ? (
                                <div className="mt-3 error-message">{errors.query}</div>
                            ) : null}

                            {touched.query && errors.query ? (
                                <div className="error-message">{errors.query}</div>
                            ) : null}

                            <Row className={'mt-3'}>
                                <Col xs={2}>
                                    <Button className="btn-sm btn-success" type="submit" disabled={isSubmitting}>
                                        <b>Update</b>
                                    </Button>
                                </Col>
                                <Col xs={2}>
                                    <div onClick={props.close} className={'btn btn-sm btn-secondary'}>
                                        Cancel
                                    </div>
                                </Col>

                            </Row>
                        </Form>

                    )}
                </Formik>
            </Background>
        </Container>
    );
};


export default UpdateDatasetQualityRule;
