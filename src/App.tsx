import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardBody, Col, Input, Progress, Row, Table, Button, Container } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Principal } from "@dfinity/principal";
import './App.css';

import { FileExtension, FileInfo, getBackendActor }  from './agent';

const MAX_CHUNK_SIZE = 1024 * 500; // 500kb

const getReverseFileExtension = (type: { string: null }) : string => {
  switch(Object.keys(type)[0]) {
    case 'jpeg':
      return  'image/jpeg';
    case 'gif':
      return  'image/gif'; 
    case 'jpg':
      return  'image/jpg';       
    case 'png':
      return  'image/png';
    case 'svg':
      return  'image/svg';
    case 'avi':
      return  'video/avi';
    case 'mp4':
      return  'video/mp4';
    case 'aac':
      return  'video/aac';
    case 'wav':
      return  'audio/wav';
    case 'mp3':
      return  'audio/mp3';                                                                                                              
    default :
    return "";
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
    case 'audio/mp3':
      return { 'mp3' : null };
    default :
    return null;
  }
};

const CdnElement: React.FC<any> = (props) => {

    const [fileData, setFileData] = useState('Drag and drop a file or select add Image');
    const [file, setFile] = useState<FileReaderInfo>({
      name: '',
      type: '',
      size: 0,
      blob: new Blob(),
      width: 0,
      file: 0,
      height: 0
    });
    const [ready, setReady] = useState(false);
    const [uploading, setUploading] = useState(false);
    let [value, setValue] = useState(0);

    interface FileReaderInfo {
      name: string;
      type: string;
      size: number;
      blob: Blob;
      width: number;
      file: number;
      height: number;
    }

    const b64toBlob = (b64Data: string, contentType='', sliceSize=512) => {
      
      const byteCharacters = atob(b64Data);
      const byteArrays = [];
    
      for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
    
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
    
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      const blob = new Blob(byteArrays, { type: contentType } );
      return blob;
  }

    const handleChange = (event: React.FormEvent<HTMLInputElement>) => {
        setReady(false);
        // @ts-ignore
        const file = event.target.files[0];
        // console.log(file);
        // Make new FileReader
        const reader = new FileReader();
        // Convert the file to base64 text
        reader.readAsDataURL(file);
  
      
        reader.onloadend = () => {
          if (reader.result === null) {
            throw new Error('file empty...');
          }
          let encoded = reader.result.toString().replace(/^data:(.*,)?/, '');
          if ((encoded.length % 4) > 0) {
            encoded += '='.repeat(4 - (encoded.length % 4));
          }
          // console.log(file.type);
          const blob = b64toBlob(encoded, file.type);
          // console.log(blob);
          const fileInfo: FileReaderInfo = {
            name: file.name,
            type: file.type,
            size: file.size,
            blob: blob,
            file: file,
            width: file.width,
            height: file.height
          };
          setFileData(file.name + ' | ' + Math.round(file.size / 1000) + ' kB');
          setFile(fileInfo);
          setReady(true);
        };
    };

    const encodeArrayBuffer = (file: ArrayBuffer): number[] =>
      Array.from(new Uint8Array(file));

    const processAndUploadChunk = async (
      blob: Blob,
      byteStart: number,
      fileSize: number,
      fileId: string,
      chunk: number
    ) : Promise<any> => {
      console.log(byteStart);
      console.log(Math.min(fileSize, byteStart + MAX_CHUNK_SIZE));
      console.log(chunk);
      const blobSlice = blob.slice(
        byteStart,
        Math.min(fileSize, byteStart + MAX_CHUNK_SIZE),
        blob.type
      );
      const bsf = await blobSlice.arrayBuffer();

      const ba = await getBackendActor();
      console.log(fileId);
      return ba.putFileChunks(fileId, BigInt(chunk), BigInt(fileSize), encodeArrayBuffer(bsf));
      // return ba.putChunks(fileId, chunk, encodeArrayBuffer(bsf));


      // const test = await getTestActor();
      // return test.putChunks(fileId, chunk, encodeArrayBuffer(bsf));
      
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
        throw new Error('file not uploaded or wrong format!');
      }
      setUploading(true);
      const fileInfo : FileInfo = {
        name: Math.random().toString(36).substring(2),
        createdAt: BigInt(Number(Date.now() * 1000)),
        size: BigInt(file.size),
        chunkCount: BigInt(Number(Math.ceil(file.size / MAX_CHUNK_SIZE))),
        extension: fileExtension,
      };

      const ba = await getBackendActor();
      // const authenticated = await authClient.isAuthenticated();
      // console.log(authenticated);

      const fileId = (await ba.putFileInfo(fileInfo))[0] as string;
      console.log(fileId);


      setValue(40);
      const blob = file.blob;
      const putChunkPromises: Promise<undefined>[] = [];
      let chunk = 1;
      for (let byteStart = 0; byteStart < blob.size; byteStart += MAX_CHUNK_SIZE, chunk++ ) {
        putChunkPromises.push(
          processAndUploadChunk(blob, byteStart, file.size, fileId, chunk)
        );
      }
      // setChunks(putChunkPromises);
      await Promise.all(putChunkPromises);
      setValue(100);
      setUploading(false);
      const t1 = performance.now();
      console.log("Upload took " + (t1 - t0) / 1000 + " seconds.")
      
    }

    if (uploading) {
        return  <React.Fragment>
          <Col className='col-8'>
            <Progress multi>
                <Progress animated bar color="success" value={value} max="100"/>
            </Progress>
          </Col>
      </React.Fragment>;
    }
    return <React.Fragment>
        <Col className="col-8">
            <div className="image-upload-wrap">
              <Input className="file-upload-input" type='file' onChange={handleChange} />
              <div className="drag-text">
                <h3>{fileData}</h3>
                <img src='http://100dayscss.com/codepen/upload.svg' className='upload-icon'/>
              </div>
            </div>
            {!!ready && 
                  <Button className="file-upload-btn" type="button"  onClick={handleUpload} >Upload</Button>
            }
        </Col>
    </React.Fragment>;

};

const Canisters: React.FC<any> = (props) => {

  let [containers, setContainers] = useState([] as any);
  useEffect(() => {
    updateContainers();
  }, []);

  const updateContainers = async () => {
    const ba = await getBackendActor();
    const status = await ba.getStatus();
    setContainers(status);
  }

  return <React.Fragment> 
  <Col  className="col-12">
  {containers.map((element: any) => {
     return (
      <ul className="list-group">
        <li className="list-group-item d-flex justify-content-between align-items-center">
          {element[0]}
          <span className="badge badge-primary badge-pill text-danger">Free space: {Number(element[1]) / 1000} Kb</span>
        </li>
      </ul>
      )
    })}
  </Col>
  </React.Fragment>
};

const FilesInfo : React.FC<any> = (props) => {
  const [filesInfo, setFilesInfo] = useState([] as any);
  const [img, setImg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getFilesInfo();
  }, []);

  const getFilesInfo = async () => {
    const ba = await getBackendActor();
    const files = await ba.getAllFiles();
    console.log(files); 
    setFilesInfo(files[0]);
  }

  const clean = () => {
    if (img !== '') {
      console.log('dawdaw');
      URL.revokeObjectURL(img);
      setImg('');
      
    }
    
  }

  const loadChunks = async (e: React.FormEvent<HTMLButtonElement>, fi: any) => {
    e.preventDefault();
    console.log(fi);
    setLoading(true);
    const ba = await getBackendActor();
    // const chunk = await ba.getFileChunk(fi.fileId, BigInt(1));
    // console.log(chunk);
    const chunks = [];
    for (let i = 1; i <= Number(fi.chunkCount); i++) {
      const chunk = await ba.getFileChunk(fi.fileId, BigInt(i));
      chunks.push(new Uint8Array(chunk[0]).buffer);
      console.log(chunk);
    }
    const blob = new Blob(chunks, { type: getReverseFileExtension(fi.extension)} );
    console.log(blob);
    const url = URL.createObjectURL(blob);
    console.log(url);
    setImg(url);
    setLoading(false);
  }

  return <React.Fragment>
    <Row>
        <Col className="col-6">
        <Table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Size</th>
              <th>Extension</th>
              <th>View</th>
            </tr>
          </thead>
      <tbody>
      {filesInfo.map((element: any) => {
        console.log(element);
        const extension = Object.keys(element.extension)[0];
              return (
          <tr>
          <th >{element.fileId}</th>
          <td>{Number(element.size) / 1000} Kb</td>
          <td>{extension}</td>
          <td><Button onClick={(e) => loadChunks(e, element)}>Load</Button></td>
        </tr>
                )
        })}
      
      </tbody>
        </Table>
        </Col>
        <Col className="col-6">
          {loading && 
          <div className="spinner-border" role="status">
            </div>
          }
          {(img !== '') && 
            <div>
              <p>Open this in a new tab: {img}</p>
              <Button onClick={() => {navigator.clipboard.writeText(img)}}>Copy to clipboard</Button>
              <Button onClick={clean}>Clean Blob</Button> 
            </div>
          }
          
        </Col>
      </Row>
  </React.Fragment>;

}


function App() {

  const [val, setVal] = useState(0);

  const onIncrement = useCallback(async () => {
    const ba = await getBackendActor();
    // 11277066696730617340
    const fileInfo = await ba.getFileInfo("11277066696730617340");
    console.log(fileInfo);
    // @ts-ignore
    const b1 = await ba.getFileChunk("11277066696730617340", BigInt(1));
    const b2 = await ba.getFileChunk("11277066696730617340", BigInt(2));
    // console.log(b2[0]);
    // @ts-ignore
    const b11 = new Uint8Array(b1[0]).buffer;
    // @ts-ignore
    const b22 = new Uint8Array(b2[0]).buffer;
    console.log(b11);
    // @ts-ignore
    const blob = new Blob([b11, b22], { type: getReverseFileExtension(fileInfo[0].extension) } );
    console.log(blob);
    console.log(URL.createObjectURL(blob));
    setVal(1);
  }, []);

  const getStatus = useCallback(async () => {
    const ba = await getBackendActor();
    const vals = await ba.getStatus();
    // console.log(Number(vals[0][1]));
    if (vals.length > 0) {
      for (let val of vals) {
        console.log(val[0]);
        console.log(Number(val[1]));
      }
    }
    setVal(1);
  }, []);

  return (
    <div className="App">
      <Container>
        <br/>
        <br/>
        <br/>
        <br/>
        <Row>
          <Col className="col-6">
          <CdnElement />
          </Col>
          <Col className="col-6">
          <Canisters/>
          </Col>
        </Row>
        
        <FilesInfo/>
        
        <button onClick={getStatus}>Status</button>
        <button onClick={onIncrement}>Load</button>
      </Container>

        
    </div>
  );
}

export default App;
