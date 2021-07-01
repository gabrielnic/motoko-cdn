import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardBody, CardHeader, Col, FormGroup, Input, Progress, Row, Table, Button } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Principal } from "@dfinity/principal";
import './App.css';

import { FileExtension, FileInfo, getBackendActor }  from './agent';

const MAX_CHUNK_SIZE = 1024 * 500; // 500kb

const CdnElement: React.FC<any> = (props) => {

    const [fileData, setFileData] = useState('Click or Drop a file to upload');
    const [file, setFile] = useState<FileReaderInfo>({
      name: '',
      type: '',
      size: 0,
      buffer: new ArrayBuffer(0),
      width: 0,
      file: 0,
      height: 0
    });
    const [ready, setReady] = useState(false);
    const [uploading, setUploading] = useState(false);
    let [value, setValue] = useState(0);
    let [containers, setContainers] = useState([] as any);

    useEffect(() => {
      console.log('dawdwa');
      updateContainers();
    }, []);

    // let [chunks, setChunks] = useState([] as any);
    // let [fileInfo, setfileInfo] = useState({} as any);

    interface FileReaderInfo {
      name: string;
      type: string;
      size: number;
      buffer: ArrayBuffer;
      width: number;
      file: number;
      height: number;
    }
    const handleChange = (event: React.FormEvent<HTMLInputElement>) => {
        setReady(false);
        // @ts-ignore
        const files = event.target.files;
        // Process each file
        for (const file of files) {
            // Make new FileReader
            const reader = new FileReader();
            // img.src =
            // Convert the file to base64 text
            reader.readAsArrayBuffer(file);
            // on reader load somthing...
            reader.onload = () => {
                // Make a fileInfo Object
                
                // Push it to the state
            };
            reader.onloadend = () => {
              const fileInfo: FileReaderInfo = {
                name: file.name,
                type: file.type,
                size: file.size,
                buffer: reader.result as ArrayBuffer,
                file: file,
                width: file.width,
                height: file.height
              };
              console.log(fileInfo);
                // props.onChange(undefined, fileInfo.base64);
                setFileData(file.name + ' | ' + Math.round(file.size / 1000) + ' kB');
                setFile(fileInfo);
                setReady(true);
            };
        }
    };

    const getFileExtension = (type: string) : FileExtension | null => {
      switch(type) {
        case 'image/jpeg':
          return { 'jpeg' : null };
        case 'image/gif':
          return { 'gif' : null };
        case 'image/jpg':
          return { 'jpg' : null };
        case 'image/png':
          return { 'png' : null };          
        case 'image/svg':
          return { 'svg' : null };          
        case 'video/avi':
          return { 'avi' : null };                            
        case 'video/aac':
          return { 'aac' : null };
        case 'video/mp4':
          return { 'mp4' : null };        
        case 'audio/wav':
          return { 'wav' : null };                         
        case 'image/mp3':
          return { 'mp3' : null };
        default :
        return null;
      }
    }
    const encodeArrayBuffer = (file: ArrayBuffer): number[] =>
      Array.from(new Uint8Array(file));

    const processAndUploadChunk = async (
      fileBuffer: ArrayBuffer,
      byteStart: number,
      fileSize: number,
      fileId: string,
      chunk: bigint
    ) => {
      const fileSlice = fileBuffer.slice(
        byteStart,
        Math.min(fileSize, byteStart + MAX_CHUNK_SIZE)
      );
      const sliceToNat = encodeArrayBuffer(fileSlice);
      console.log(sliceToNat);
      const ba = await getBackendActor();
      const testObject = {fileId: fileId, chunk: chunk, sliceToNat : sliceToNat};
      // setChunks([...chunks, testObject]);
      return ba.putFileChunks(fileId, chunk, sliceToNat);
    }

    const handleTest = async(event: React.FormEvent<HTMLButtonElement>) => {
      event.preventDefault();
    //   // console.log(chunks);
    //   // console.log(fileInfo);
    //   const ba = await getBackendActor();
    //   var i = 1;                  //  set your counter to 1
    //   async function myLoop() {         //  create a loop function
    //     const fileId = (await ba.putFileInfo(fileInfo))[0] as string;
    //     console.log("done1");
    //     const fileBuffer =  file.buffer || new ArrayBuffer(0);
    //     const putChunkPromises: Promise<undefined>[] = [];
    //     let chunk = 1;
    //     for (let byteStart = 0; byteStart < file.size; byteStart += MAX_CHUNK_SIZE, chunk++ ) {
    //       putChunkPromises.push(
    //         processAndUploadChunk(fileBuffer, byteStart, file.size, fileId, BigInt(chunk))
    //       );
    //     }
    //     console.log('done2');
    //     await Promise.all(putChunkPromises);
    //     console.log('done3');
    //     await new Promise(resolve => setTimeout(resolve, 10000))
    //     console.log('10 sec timeout');
    //     if (i < 100) {
    //       await myLoop();
    //     }
    //   }

    //   await myLoop();       
    }

    const handleUpload = async (event: React.FormEvent<HTMLButtonElement>) => {
      // event.preventDefault();
      const t0 = performance.now();
      console.log('upload started...');
      const fileExtension = getFileExtension(file.type);
      if (file === null || file === undefined || fileExtension === null) {
        throw new Error('file not uploaded!');
      }
      const fileInfo : FileInfo = {
        name: file.name,
        createdAt: BigInt(Number(Date.now() * 1000)),
        size: BigInt(file.size),
        chunkCount: BigInt(Number(Math.ceil(file.size / MAX_CHUNK_SIZE))),
        extension: fileExtension,
      };

      const ba = await getBackendActor();
      // const authenticated = await authClient.isAuthenticated();
      // console.log(authenticated);
      setUploading(true);
      setValue(5);
      // const principal = await ba.whoami();
      // console.log(principal);

       const fileId = (await ba.putFileInfo(fileInfo))[0] as string;
      console.log(fileId);
      setValue(40);
      console.log(file);
      console.log(fileInfo);
      // setfileInfo(fileInfo);
      const fileBuffer =  file.buffer || new ArrayBuffer(0);
      const putChunkPromises: Promise<undefined>[] = [];
      let chunk = 1;
      for (let byteStart = 0; byteStart < file.size; byteStart += MAX_CHUNK_SIZE, chunk++ ) {
        putChunkPromises.push(
          processAndUploadChunk(fileBuffer, byteStart, file.size, fileId, BigInt(chunk))
        );
      }
      // setChunks(putChunkPromises);
      await Promise.all(putChunkPromises);
      setValue(100);

      updateContainers();

      const t1 = performance.now();
      console.log("Upload took " + (t1 - t0) / 1000 + " seconds.")
      setUploading(false);
    }


    const updateContainers = async () => {
      const ba = await getBackendActor();
      const status = await ba.getStatus();
      console.log(status);
      setContainers(status);
    }

    if (uploading) {
        return  <React.Fragment>
          <Col className='col-2'>
              <strong> {props.Title}</strong>
          </Col>
          <Col className='col-6'>
              <Card id={props.id}>
                  <CardBody className='upload-card'>
                      <Row>
                          <Col xs='6'>
                              {/* <LoadingSpinner altText=''/> */}
                              <Progress multi>
                                  <Progress animated bar color="success" value={value} max="100"/>
                              </Progress>
                          </Col>
                      </Row>
                  </CardBody>
              </Card>
          </Col>
      </React.Fragment>;
    }
    console.log(containers);
    return <React.Fragment>
            <Col className='col-2'>
                <strong> {props.Title}</strong>
            </Col>
            <Col className='col-8'>
            <div className="spinner-border" role="status"></div>
                <Card id={props.id}>
                    <CardBody className='upload-card'>
                        <Row>
                            <Col xs='6'>
                            {containers.map((element: any) => {
              const principal = Principal.fromUint8Array(element[0]);
              return (
                <ul className="list-group">
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    {principal.toString()}
                    <span className="badge badge-primary badge-pill text-danger">{Number(element[1]) / 1000} Kb</span>
                  </li>
                </ul>
               
                )
                
                            })}
                            <div className="file-upload">
                                <button className="file-upload-btn" type="button" >Add Image</button>

                                <div className="image-upload-wrap">
                                  <input className="file-upload-input" type='file' onChange={handleChange} accept="image/*" />
                                  <div className="drag-text">
                                    <h3>Drag and drop a file or select add Image</h3>
                                  </div>
                                </div>
                                <div className="file-upload-content">
                                  <img className="file-upload-image" src="#" alt="your image" />
                                  <div className="image-title-wrap">
                                    <button type="button" className="remove-image">Remove <span className="image-title">Uploaded Image</span></button>
                                  </div>
                                </div>
                              </div>
                               <Button className='btn btn-sm upload-icon' onClick={handleTest}>Test</Button>
                                <FormGroup row>
                                    <div className={props.invalid ? 'center alert-danger-select' : 'center'}>
                                        <div className='title'>
                                            <h6>  {props.formContext === 'edit' &&
                                            <i className='fa fa-exchange'>&nbsp;</i>
                                            } { fileData } </h6>
                                        </div>
                                        <div className='dropzone'>
                                            <img src='http://100dayscss.com/codepen/upload.svg' className='upload-icon'/>
                                            <Input id='file-input' name='file-input' onChange={handleChange} type='file' className='upload-input'/>
                                        </div>
                                    </div>
                                </FormGroup>
                                {!!ready && 
                                            <Button className='btn btn-sm upload-icon' onClick={handleUpload}>Upload</Button>
                                }
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
            </Col>
    </React.Fragment>;

};


function App() {

  const [val, setVal] = useState(0);

  const onIncrement = useCallback(async () => {
    // @ts-ignore
    // await btest.increment();
    // @ts-ignore
    // setVal((await btest.getValue()).toString());
    const actor = await getBackendActor();
    setVal(1);
  }, []);

  const getStatus = useCallback(async () => {
    const ba = await getBackendActor();
    const vals = await ba.getStatus();
    console.log(Number(vals[0][1]));
    setVal(1);
  }, []);


  return (
    <div className="App">
      
        <button onClick={getStatus}>Status</button>
        <CdnElement />
    </div>
  );
}

export default App;
