import React, {useContext, useState} from 'react';
import Modal from "react-bootstrap/Modal";
import {Button, Dropdown, Form, Row, Col} from "react-bootstrap"
import { ModalContext } from "../context/ModalContext/ModalContext";
import {Context} from "../index";
import {observer} from "mobx-react-lite";
import {createBrand, createType, createDevice} from "../http/deviceAPI";
import { modalType } from './../context/ModalContext/ModalContextProvider';

const CustomModal = observer(({typeModal, titleModal, placeholder}) => {
    const {device} = useContext(Context)
    const { closeModal } = useContext(ModalContext);   

    const [value, setValue] = useState('');
    const [name, setName] = useState('')
    const [price, setPrice] = useState('')
    const [file, setFile] = useState(null)
    const [info, setInfo] = useState([])

    const addInfo = () => {
        setInfo([...info, {title: '', description: '', number: Date.now()}])
    }
    const removeInfo = (number) => {
        setInfo(info.filter(i => i.number !== number))
    }
    const changeInfo = (key, value, number) => {
        setInfo(info.map(i => i.number === number ? {...i, [key]: value} : i))
    }

    const selectFile = e => {        
        setFile(e.target.files[0])
    }

    const addBrand = () => {
        createBrand({name: value}).then(data => {
            setValue('')
            closeModal()
        })
    }

    const addType = () => {
        createType({name: value}).then(data => {
            setValue('')
            closeModal()
        })
    }    

    const addDevice = () => {
        const formData = new FormData()
        formData.append('name', name)
        formData.append('price', `${price}`)
        formData.append('img', file)
        formData.append('brandId', device.selectedBrand.id)
        formData.append('typeId', device.selectedType.id)
        formData.append('info', JSON.stringify(info))
        createDevice(formData).then(data => closeModal())
    }

    const onClickAdd = () => {
        if (typeModal === modalType.ADD_BRAND) {
            addBrand()
        }
        if (typeModal === modalType.ADD_TYPE) {
            addType()
        }
        if (typeModal === modalType.ADD_DEVICE) {
            addDevice()
        }
    }

    return (
        <Modal
            show={!!typeModal}
            onHide={closeModal}
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    {titleModal}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                {
                    typeModal === modalType.ADD_DEVICE 
                        ? <>
                            <Dropdown className="mt-2 mb-2">
                                <Dropdown.Toggle>{device.selectedType.name || "Choose Type"}</Dropdown.Toggle>
                                <Dropdown.Menu>
                                    {device.types.map(type =>
                                        <Dropdown.Item
                                            onClick={() => device.setSelectedType(type)}
                                            key={type.id}
                                        >
                                            {type.name}
                                        </Dropdown.Item>
                                    )}
                                </Dropdown.Menu>
                            </Dropdown>
                            <Dropdown className="mt-2 mb-2">
                                <Dropdown.Toggle>{device.selectedBrand.name || "Choose Brand"}</Dropdown.Toggle>
                                <Dropdown.Menu>
                                    {device.brands.map(brand =>
                                        <Dropdown.Item
                                            onClick={() => device.setSelectedBrand(brand)}
                                            key={brand.id}
                                        >
                                            {brand.name}
                                        </Dropdown.Item>
                                    )}
                                </Dropdown.Menu>
                            </Dropdown>
                            <Form.Control
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="mt-3"
                                placeholder="Fill name of product"
                            />
                            <Form.Control
                                value={price}
                                onChange={e => setPrice(e.target.value)}
                                className="mt-3"
                                placeholder="Fill cost of product"
                                type="number"
                            />
                            <Form.Control
                                className="mt-3"
                                type="file"
                                onChange={selectFile}
                            />
                            <hr/>
                            <Button
                                variant={"outline-dark"}
                                onClick={addInfo}
                            >
                                Add new parameter
                            </Button>
                            {info.map(i =>
                                <Row className="mt-4" key={i.number}>
                                    <Col md={4}>
                                        <Form.Control
                                            value={i.title || ''}
                                            onChange={(e) => changeInfo('title', e.target.value, i.number)}
                                            placeholder="Fill title"
                                        />
                                    </Col>
                                    <Col md={4}>
                                        <Form.Control
                                            value={i.description}
                                            onChange={(e) => changeInfo('description', e.target.value, i.number)}
                                            placeholder="Fill description"
                                        />
                                    </Col>
                                    <Col md={4}>
                                        <Button
                                            onClick={() => removeInfo(i.number)}
                                            variant={"outline-danger"}
                                        >
                                            Delete
                                        </Button>
                                    </Col>
                                </Row>
                            )}
                        </>
                        : <Form.Control
                            value={value}
                            onChange={e => setValue(e.target.value)}
                            placeholder={placeholder}
                        />
                }
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-danger" onClick={closeModal}>Close</Button>
                <Button variant="outline-success" onClick={() => onClickAdd(typeModal)}>Add</Button>
            </Modal.Footer>
        </Modal>
    );
});

export default CustomModal;