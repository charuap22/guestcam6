import { useState, useRef } from "react";
import { Alert, AlertIcon, Center, Box, Text } from "@chakra-ui/react";
import { ProgressBar } from "./ProgressBar";
import { AddCircleIcon } from "chakra-ui-ionicons";
import { useEvent } from "../hooks/useEvent";
 
const UploadForm = ({user}) => {
  //const [files, setFiles] = useState(null);
  
  const [error, setError] = useState(null);
  const types = ["image/png", "image/jpeg","video/mp4","video/mov"];

  //multiple files
  const [files, setFiles] = useState([]);
  


  const changeHandler = (e) => {
    setFiles(null);
    const valid = 1;
    for (let i = 0; i < e.target.files.length; i++) {
      // console.log(e.target.files[i]); // DISPLAYS EACH FILE
      // if (!types.includes(e.target.files[i].type)) {
      //   setError("Selected file must be an image");
      //   valid = 0;
      //   return;
      // }
      
    }
    if (valid) setFiles([...e.target.files]);
  };

  // Create a reference to the hidden file input element
  const hiddenFileInput = useRef(null);
  const handleClick = (event) => {
    hiddenFileInput.current.click();
  };

  return (
    <>
      <Box width="100%" alignContent="center">
        <Center>
          <form>
            <label>
              <AddCircleIcon
                w="60px"
                h="60px"
                color="yellow.500"
                onClick={handleClick}
                align="center"
              />
            </label>
            <div className="output">
              {error && (
                <Alert status="error">
                  <AlertIcon />
                  {error}
                </Alert>
              )}
              <br></br>
              <input
                type="file"
                accept=".jpeg, .png, .jpg, video/*"
                multiple
                ref={hiddenFileInput}
                onChange={changeHandler}
                style={{ display: "none" }}
              />
              {/* {file && <div>{file.name}</div>} */}
            </div>
          </form>
        </Center>
      </Box>
      {/* <Box w="100%">
        <Center>
          {files.map((file, index) => (
            <Text>{file.name}</Text>
          ))}
        </Center>
      </Box> */}
      <Box w="100%" mt="20px">
        <Center>
          {files.map((file, index) => (
            <ProgressBar
              file={file}
              user={user}
              fileurl={URL.createObjectURL(file)}
              fileType={file.type.includes("image") ? "gallery" : "videos"}
            />
          ))}
        </Center>
      </Box>
    </>
  );
};

export default UploadForm;
