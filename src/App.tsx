import React, { useEffect, useState, useCallback } from 'react';
import { Col, Input, Progress, Row, Table, Button, Container, Pagination, PaginationLink, PaginationItem } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Principal } from "@dfinity/principal";
import './App.css';

import { BackendActor }  from './agent';
import { FileExtension, FileInfo } from './declarations/backend/backend.did';
import { getManagementCanister } from '@dfinity/agent';
import { createActor } from './declarations/backend';




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

const CdnElement: React.FC<any> = ({ updateDeps, setErrros }) => {

    const [fileData, setFileData] = useState('Drag and drop a file or select add File');
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
        setErrros([]);
        setReady(false);
        // @ts-ignore
        const file = event.target.files[0];
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
          const blob = b64toBlob(encoded, file.type);
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
      fileId: string,
      chunk: number,
      fileSize: number,
    ) : Promise<any> => {
      const blobSlice = blob.slice(
        byteStart,
        Math.min(Number(fileSize), byteStart + MAX_CHUNK_SIZE),
        blob.type
      );
     
      const bsf = await blobSlice.arrayBuffer();
      const ba = await BackendActor.getBackendActor();
      // console.log(fileId);
      // console.log(chunk);
      // console.log(fileSize);
      // console.log(encodeArrayBuffer(bsf));
      return ba.putFileChunks(fileId, BigInt(chunk), BigInt(fileSize), encodeArrayBuffer(bsf));
    }

    // const infiniteTest = async(event: React.FormEvent<HTMLButtonElement>) => {
      // event.preventDefault();
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
    // }

    const handleUpload = async (event: React.FormEvent<HTMLButtonElement>) => {
      event.preventDefault();
      const fileExtension = getFileExtension(file.type);
      const errors = [];
      if (file === null || file === undefined || fileExtension === null) {
        errors.push("File not valid!");
      }
      if (file.size > 10550000) {
        errors.push("File size shouldn't be bigger than 10mb");
      }

      if (errors.length > 0) {
        setErrros(errors);
        return;
      }
      
      const t0 = performance.now();
      console.log('upload started...');
      setUploading(true);
      const fileInfo : FileInfo = {
        name: Math.random().toString(36).substring(2),
        createdAt: BigInt(Number(Date.now() * 1000)),
        size: BigInt(file.size),
        chunkCount: BigInt(Number(Math.ceil(file.size / MAX_CHUNK_SIZE))),
        // @ts-ignore
        extension: fileExtension,
      };
      const ba = await BackendActor.getBackendActor();
      setValue(10);
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
          processAndUploadChunk(blob, byteStart, fileId, chunk, file.size)
        );
      }
      await Promise.all(putChunkPromises);
      await ba.updateStatus();
      setValue(100);
      setUploading(false);
      setReady(false);
      updateDeps();
      setFileData('Drag and drop a file or select add File');
      const t1 = performance.now();
      console.log("Upload took " + (t1 - t0) / 1000 + " seconds.")
      
    }

    if (uploading) {
        return  <React.Fragment>
          <Col className='col-8'>
          <div className="image-upload-wrap">
            <Progress multi>
                <Progress animated bar color="success" value={value} max="100"/>
            </Progress>
            </div>
          </Col>
      </React.Fragment>;
    }
    return <React.Fragment>
        <Col className="col-8">
            <div className="image-upload-wrap">
              <div className="drag-text">
              <Input className="file-upload-input" type='file' onChange={handleChange} />
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

const Canisters: React.FC<any> = ({ rerender }) => {

  let [containers, setContainers] = useState([] as any);
  let [loading, setLoading] = useState(false);
  useEffect(() => {
    console.log('triggers canisters');
    setLoading(true);
    updateContainers();
  }, [rerender]);

  const updateContainers = useCallback(async () => {
    console.log('updating....');
    const ba = await BackendActor.getBackendActor();
    const status = await ba.getStatus();
    // console.log(status);
    setContainers(status);
    setLoading(false);
  }, []);

  if (loading){
    return <div className="spinner-border" role="status"></div>
  } 
    

  return <React.Fragment> 
  <Col  className="col-12">
  {containers.map((element: any) => {
    const cid = Principal.fromUint8Array(element[0].toUint8Array()).toText();
    console.log(cid);
     return (
      <ul className="list-group">
        <li className="list-group-item d-flex justify-content-between align-items-center">
          {cid}
          <span className="badge badge-primary badge-pill text-danger">Free space: {Number(element[1]) / 1000} Kb</span>
        </li>
      </ul>
      )
    })}
  </Col>
  </React.Fragment>
};

const FilesInfo : React.FC<any> = ({ rerender }) => {
  const [filesInfo, setFilesInfo] = useState([] as any);
  const [img, setImg] = useState("");
  const [fileLoading, setFileLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    console.log('triggers files...');
    setLoading(true);
    getFilesInfo();
    getCanister();
  }, [rerender]);

  const getCanister = async () => {
    const ba = await BackendActor.getBackendActor();
    const fileinfo = await ba.getFileInfo(Principal.fromText("renrk-eyaaa-aaaaa-aaada-cai"));
    const actor = createActor(Principal.fromText("renrk-eyaaa-aaaaa-aaada-cai"), {
      agentOptions: {
        host: "http://localhost:8000",
      }
    });
    // @ts-ignore
    console.log(await actor.getSize());
    const bucket = fileinfo[0];
     // @ts-ignore
    console.log(await bucket.getFileInfo("test"));
  };

  const getFilesInfo = async () => {
    const ba = await BackendActor.getBackendActor();
    const files = await ba.getAllFiles();
    setFilesInfo([]);
    setLoading(false);
  };

  const clean = () => {
    if (img !== '') {
      URL.revokeObjectURL(img);
      setImg('');
    }
  };

  const handlePagination = (e: any, index: number) => {
    e.preventDefault();
    setCurrentPage(index);
  }

  const loadChunks = async (e: React.FormEvent<HTMLButtonElement>, fi: any) => {
    e.preventDefault();
    setImg("");
    setFileLoading(true);
    const ba = await BackendActor.getBackendActor();
    const chunks = [];
    for (let i = 1; i <= Number(fi.chunkCount); i++) {
      const chunk = await ba.getFileChunk(fi.fileId, BigInt(i), fi.cid);
      if (chunk[0]) {
        chunks.push(new Uint8Array(chunk[0]).buffer);
      }
    }
    const blob = new Blob(chunks, { type: getReverseFileExtension(fi.extension)} );
    const url = URL.createObjectURL(blob);
    setImg(url);
    setFileLoading(false);
  }
  if (loading){
    return <Col className="col-6"><div className="spinner-border" role="status"></div></Col>
  }
  const pageSize = 5;
  const pagesCount = Math.ceil(filesInfo.length / pageSize);
  return <React.Fragment>
    <Row>
        <Col className="col-6">
          <Table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Size</th>
                <th>Extension</th>
                <th>Canister ID</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody>
          {filesInfo
            .slice(
              currentPage * pageSize,
              (currentPage + 1) * pageSize
            )
            .map((data: any, i: any) => {
              console.log(data);
              const cid = Principal.fromUint8Array(data.cid.toUint8Array()).toText();
              const extension = Object.keys(data.extension)[0];
              return <tr key={i}>
                    <th >{data.fileId}</th>
                    <td>{Number(data.size) / 1000} Kb</td>
                    <td>{extension}</td>
                    <td>{cid}</td>
                    <td><Button onClick={(e) => loadChunks(e, data)}>Load</Button></td>
                </tr>
            })}
             </tbody>
              </Table>
              <Pagination aria-label="cdn navigation">
            <PaginationItem disabled={currentPage <= 0}>
              <PaginationLink
                onClick={e => handlePagination(e, currentPage - 1)}
                previous
                href="#"
              />
            </PaginationItem>

            {[...Array(pagesCount)].map((page, i) => 
              <PaginationItem active={i === currentPage} key={i}>
                <PaginationLink onClick={e => handlePagination(e, i)} href="#">
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            )}
            <PaginationItem disabled={currentPage >= pagesCount - 1}>
              
              <PaginationLink
                onClick={e => handlePagination(e, currentPage + 1)}
                next
                href="#"
              />
            </PaginationItem>
          </Pagination>
        </Col>
        <Col className="col-6">
          {fileLoading && 
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

  const [deps, setDeps] = useState(false);
  const [erorrs, setErrors] = useState([]);
  const updateDeps = () => {
    console.log('force reupdate child...');
    setDeps(!deps);
  };

  return (
    <div className="App">
      <Container>
        <br/><br/>
        {erorrs && erorrs.map((err) => {
            return (
              <div className="alert alert-danger" role="alert">{err}</div>
            )
        })}
        <br/><br/>
        <Row>
          <Col className="col-12">
          <div className="alert alert-warning" role="alert">
                Max file size: 10mb -----
                Accepted extensions: jpeg, gif, jpg, png, svg, avi, aac, mp4, wav, mp3 
            </div>
          </Col>
          <Col className="col-6">
          <CdnElement updateDeps={updateDeps} setErrros={setErrors} />
          </Col>
          <Col className="col-6">
          <Canisters rerender={deps}/>
          </Col>
        </Row>
        <br/><br/>
        <FilesInfo rerender={deps}/>
        <br/>
        <br/>
      </Container>
      <footer className="footer">
          <div className="alert alert-info" role="alert">
                You can check the code here:  
                <a href="https://github.com/gabrielnic/motoko-cdn" target="_blank" className="alert-link"> Source Code</a>
          </div>
      </footer>
        
    </div>
  );
}

export default App;
