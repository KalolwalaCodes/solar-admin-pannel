import React, { useEffect, useState } from "react";
import Box from "@mui/joy/Box";
import AccordionGroup from "@mui/joy/AccordionGroup";
import Accordion from "@mui/joy/Accordion";
import AccordionDetails from "@mui/joy/AccordionDetails";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useColorScheme } from "@mui/joy/styles";
import AccordionSummary, {
  accordionSummaryClasses,
} from "@mui/joy/AccordionSummary";
import Button from "@mui/joy/Button";
import AddIcon from "@mui/icons-material/Add";
import Input from '@mui/joy/Input';
import { Alert } from "@mui/material";
import AlertInvertedColors from '../components/ui/Alerts';
const Sustainability = () => {
  const { mode } = useColorScheme();

  const [investorData, setInvestorData] = useState({});
  const [activeTab, setActiveTab] = useState("BRM");
  const [activeEditor, setActiveEditor] = useState(false);
  const [activeUploader, setActiveUploader] = useState(false);
  const [activeUploaderFolder, setActiveUploaderFolder] = useState(false);
  const [dataToSetInEditor, setDataToSetInEditor] = useState();
  const [activeFD, setActiveFD] = useState();
  const [activeFDMain, setActiveFDMain] = useState();
  const[activeFolderNAme,setActiveFolderName]=useState();
  const [filesIs,setFiles]=useState();
  const[folderIs,SetFolderIs]=useState();
  const [alertMessage,setAlertMessage]=useState('');
  // New state variables for folder editing
  const [folderToEdit, setFolderToEdit] = useState(null);
  const [editedFolderName, setEditedFolderName] = useState('');
  const [showDeleteToggler,setShowDeleteToggler]=useState(false);
    
  const [needToEdit, setNeedToEdit] = useState({
    need: false,
    value: ""
  });


  const tempArr = [
    "BRM",
    "CSR",
    "Environmental Compliance",
    "Environmental Statement",
    "ESG Reports",
    "Sustainability Policies",
    "Sustainability Reports",
  ];

//this is fetching all the required data every time component render

  useEffect(() => {
    const fetchInvestorData = async () => {
      try {
        let res = await fetch("/admin-panel/Sustainability");
        let data = await res.json();
        setInvestorData(data);
        console.log("here is ", data[activeTab][0]);
      } catch (error) {
        console.error("Error fetching investor data:", error);
      }
    };
    fetchInvestorData();
  }, [activeTab]);

  //function to edit the the file name and store all info to sending data for editing 
  
  const callMeToEditFile = (data, folderName) => {
    setActiveEditor(!activeEditor);
    console.log(data);
    setDataToSetInEditor(data);
    setNeedToEdit({ need: false, value: "" }); // Resetting the edit state when opening the editor
    setActiveFolderName(folderName); // Call the function with folderName
  };

  //function execute when user confirm to edit the file

  const handleEditFileRequest = async (dataToSetInEditor) => {
    try {
      const previousFileName = dataToSetInEditor.title; // previous file name
      const category = activeTab; // active tab as the category
      const newFileName = needToEdit.value; // new file name from input
      const folderName = activeFolderNAme; // folder name from active folder
  
      const response = await fetch('/admin-panel/Sustainability', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          previousFileName,
          newFileName,
          folderName,
          category,
        }),
      });
  
      if (response.ok) {
        console.log('File name updated successfully');
  
        // Update investorData state
        setInvestorData((prevData) => {
          // Make a deep copy of the previous state
          const updatedData = { ...prevData };
  
          // Access the category data
          const categoryData = updatedData[category] || [];
  
          // Loop through the category to find the matching folder and item
          const updatedCategoryData = categoryData.map((folder) => {
            if (folder.title === folderName) {
              // Update the folder's items
              const updatedItems = folder.items.map((item) => {
                const updatedDetails = item.details.map((detail) => {
                  // Update the file name in details
                  if (detail.title === previousFileName) {
                    return {
                      ...detail,
                      title: newFileName, // Update the file name
                    };
                  }
                  return detail;
                });
                return {
                  ...item,
                  details: updatedDetails, // Update the details array
                };
              });
  
              return {
                ...folder,
                items: updatedItems, // Update the items array
              };
            }
            return folder;
          });
  
          // Set the updated category data back into the state
          updatedData[category] = updatedCategoryData;
  
          return updatedData; // Return the updated state
        });
        setNeedToEdit({...needToEdit,need:false});
      } else {
        setAlertMessage(`Failed to update file name ,${Math.floor(Date.now() / 1000)}`)
        console.log('Failed to update file name');
      }
    } catch (error) {
      console.error('Error:', error);
      setAlertMessage(`${error.message}, ${Math.floor(Date.now() / 1000)}`);
    }
  };


 //function execute when user confirm to delete the file

  const handleDeleteFileRequest = async (dataToSetInEditor) => {
    try {
      const fileName = dataToSetInEditor.title; // file name to delete
      const category = activeTab; // active tab as the category
      const folderName = activeFolderNAme; // folder name from active folder
  
      const response = await fetch('/admin-panel/Sustainability', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName,
          folderName,
          category,
        }),
      });
  
      if (response.ok) {
        console.log('File deleted successfully');
        setAlertMessage(`File deleted successfully, ${Math.floor(Date.now() / 1000)}`)
        // Update investorData state
        setInvestorData((prevData) => {
          // Make a deep copy of the previous state
          const updatedData = { ...prevData };
  
          // Access the category data safely, if undefined, default to an empty array
          const categoryData = updatedData[category] || [];
  
          // Loop through the category to find the matching folder and item
          const updatedCategoryData = categoryData.map((folder) => {
            if (folder.title === folderName) {
              // Ensure folder.items is defined and is an array
              const updatedItems = (folder.items || []).map((item) => {
                // Ensure item.details is an array before filtering
                const updatedDetails = (item.details || []).filter((detail) => {
                  // Return only items that don't match the fileName
                  return detail.title !== fileName;
                });
  
                return {
                  ...item,
                  details: updatedDetails, // Update the details array
                };
              });
  
              return {
                ...folder,
                items: updatedItems, // Update the items array
              };
            }
            return folder;
          });
  
          // Set the updated category data back into the state
          updatedData[category] = updatedCategoryData;
  
          return updatedData; // Return the updated state
        });
  
        setNeedToEdit({ ...needToEdit, need: false });
      } else {
        setAlertMessage(`Failed to delete file ${Math.floor(Date.now() / 1000)}`);
        console.log('Failed to delete file');
      }
    } catch (error) {
      setAlertMessage(`${error.message} , ${Math.floor(Date.now() / 1000)}`);
      console.error('Error:', error);
    }
  };

  //function to open the upload file dialogue box

  const uploadHandler=(e,element)=>{
    e.stopPropagation(); 
    console.log("the element is",element);
    setActiveFD(element);
    console.log(activeFD,"things change here",element.heading);
    setActiveUploader(true);
  }

  //function to open the upload folder dialogue box

  const uploadHandlerFolder=(e,element)=>{
    e.stopPropagation(); 
    setActiveFD(element);
    // console.log(element.heading);
    setActiveUploaderFolder(true);
  }

  const deleteHandlerFolder = (e, element) => {
    e.stopPropagation();
    setActiveFD(element);
    console.log(element)
    const userConfirmed = window.confirm("Are you sure you want to delete this folder?");
    
    if (userConfirmed) {
      // User pressed OK, make the POST request
      deleteFolder(element);
    } else {
      // User pressed Cancel, do nothing
      console.log("Folder deletion canceled");
    }
  };
  
  const deleteFolder = async (itemHeading) => {
    try {
      const response = await fetch('/admin-panel/Sustainability/delete-folder-nesting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          folderName: itemHeading, // This can be the item's heading to delete
          parentFolder: activeFDMain,
          category: activeTab
        }),
      });
  
      const result = await response.text();
  
      if (response.ok) {
        console.log('Item deleted successfully');
        setAlertMessage(`Item deleted successfully ,${Math.floor(Date.now() / 1000)}`);
  
        // Update the investorData state
        setInvestorData((prevData) => {
          const updatedData = { ...prevData };
  
          const categoryData = updatedData[activeTab] || [];
  
          const updatedCategoryData = categoryData.map((folder) => {
            // Check if the folder title matches the parentFolder
            if (folder.title === activeFDMain) {
              // Remove the item that matches itemHeading
              const updatedItems = folder.items.filter(item => item.heading.toLowerCase() !== itemHeading.heading.toLowerCase());
  
              return {
                ...folder,
                items: updatedItems,
              };
            }
            return folder;
          });
  
          updatedData[activeTab] = updatedCategoryData;
  
          return updatedData;
        });
      } else {
        console.error('Error deleting item:', result);
      }
    } catch (error) {
      console.error('Request failed:', error);
    }
  };
  
  
  
  
  


  const handleUploadFileRequest = async () => {
    if (!filesIs || filesIs.length === 0) {
      console.log('No files selected');
      return;
    }
  
    const file = filesIs[0]; // Assuming only one file is uploaded at a time
  
    try {
      const itemsHeading = activeFDMain; // Use the uploaded file's name
      const category = activeTab;  // active tab as the category
      const folderName = activeFDMain; // folder name from active folder
      const fileName=file.name;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('itemsHeading', itemsHeading);
      formData.append('folderName', folderName);
      formData.append('category', category);
  
      const response = await fetch('/admin-panel/Sustainability/upload-files', {
        method: 'POST',
        body: formData, // Use FormData for file upload
      });
     console.log(response,"here is respoense ");
      if (response.ok) {
        console.log('File uploaded successfully');
        setAlertMessage(`File uploaded successfully , ${Math.floor(Date.now() / 1000)}`)
        // Update the investorData state
        setInvestorData((prevData) => {
          const updatedData = { ...prevData };
          
          const categoryData = updatedData[category] || [];
          
          const updatedCategoryData = categoryData.map((folder) => {
            if (folder.title === folderName) {
              const updatedItems = (folder.items || []).map((item) => {
                const updatedDetails = [...(item.details || []), { title: fileName }];
                
                return {
                  ...item,
                  details: updatedDetails,
                };
              });
              
              return {
                ...folder,
                items: updatedItems,
              };
            }
            return folder;
          });
          
          updatedData[category] = updatedCategoryData;
          
          return updatedData;
        });
  
        setNeedToEdit({ ...needToEdit, need: false });
      } else {
        console.log('Failed to upload file');
        setAlertMessage(`Failed to upload file , ${Math.floor(Date.now() / 1000)}`)
      }
    } catch (error) {
      console.error('Error:', error);
      setAlertMessage(`${error.message} , ${Math.floor(Date.now() / 1000)}`)
    }
    setActiveUploader(!activeUploader);
  };


  const handleUploadFolderRequest = async (folderName) => {
    try {
        // Ensure the required fields are present
        if (!folderName || !activeTab) {
            console.error('All fields are required.');
            return;
        }

        let response;

        // Send a POST request based on the folder type
        if (activeFD === 'newFolder') {
            response = await fetch('/admin-panel/Sustainability/create-folder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    folderName,
                    category: activeTab
                }),
            });
        } else {
            response = await fetch('/admin-panel/Sustainability/create-folder-nesting', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    folderName,
                    activeFD,
                    category: activeTab
                }),
            });
        }

        // Check if the response is successful
        if (!response.ok) {
            const errorMessage = await response.text();  // Get error message as text
            console.error('Error creating folder:', errorMessage);
            setAlertMessage(`Error creating folder:${errorMessage},${Math.floor(Date.now() / 1000)}`);  // Optional: display error to user
            return;
        }

        // Parse the response data
        const contentType = response.headers.get('content-type');
        let data;
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();  // Parse JSON if content-type is JSON
        } else {
            data = await response.text();  // Otherwise, get plain text
        }

        console.log('Folder created successfully:', data);
        setAlertMessage(`Folder created successfully!, ${Math.floor(Date.now() / 1000)}`);

        // Automatically update `InvestorData`
        setInvestorData((prevData) => {
            const updatedData = { ...prevData };
            const categoryData = updatedData[activeTab] || [];
           
            
     console.log("activeFD",activeFD);
            if (activeFD === 'newFolder') {
              const newFolder = {
                title: folderName,
                items: [],
            };
                // Add the new folder to the category
                updatedData[activeTab] = [...categoryData, newFolder];
            } else {
              const newFolder = {
                heading: folderName,
                details: [],
            };
                // Find the existing folder and add the nested folder
                const updatedCategoryData = categoryData.map((folder) => {
                    if (folder.title === activeFD) {
                      console.log("heelo jiii",folder.title , activeFD,newFolder);
                        const updatedItems = [newFolder,...(folder.items || [])];
                        return {
                            ...folder,
                            items: updatedItems,
                        };
                    }
                    return folder;
                });
                updatedData[activeTab] = updatedCategoryData;
            }

            return updatedData;
        });

    } catch (error) {
        console.error('Error while creating folder:', error);
        setAlertMessage(`An error occurred while creating the folder , ${Math.floor(Date.now() / 1000)}`);
    }
};



  
  

  

  return (
    <div>

      {activeEditor && (
        <div className="absolute z-20 bg-transparent w-[80%] h-[80vh] flex flex-col justify-center align-middle">
          <div className="m-auto w-[500px] h-[400px] bg-slate-200 rounded-md">
            <button onClick={() => setActiveEditor(!activeEditor)} className="font-bold text-2xl px-3 py-2 rounded-lg w-[40px]">X</button>
            <div className="flex justify-center align-middle flex-col mt-10 relative">
              <div className="text-center mt-4 text-xl">{dataToSetInEditor.title}</div>
              {needToEdit.need && (
                <div className="flex justify-center mt-10">
                  <input onChange={(e) => setNeedToEdit({ ...needToEdit, value: e.target.value })} type="text" name="" id="" />
                  <button onClick={() => handleEditFileRequest(dataToSetInEditor)} className="px-2 ml-3 bg-green-600 rounded-md text-white">done</button>
                </div>
              )}
              <div className="flex justify-center align-middle mt-10 gap-5 absolute top-[120%] left-[50%] translate-x-[-50%]">
                <button className="bg-green-500 rounded-md text-[18px] font-bold px-3 text-white py-1" onClick={() => setNeedToEdit({ ...needToEdit, need: true })}>Edit</button>
                <button onClick={()=>handleDeleteFileRequest(dataToSetInEditor)} className="bg-red-500 rounded-md text-[18px] font-bold px-3 text-white py-1">delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeUploader && (
        <div className="absolute z-20 bg-transparent w-[80%] h-[80vh] flex flex-col justify-center align-middle">
          <div className="m-auto w-[500px] h-[400px] bg-slate-200 rounded-md">
            <button onClick={() => setActiveUploader(!activeUploader)} className="font-bold text-2xl px-3 py-2 rounded-lg w-[40px]">X</button>
            <div className="flex justify-center align-middle">
              <input type="file" name="file" id="file" onChange={(e)=>setFiles(e.target.files)} />
              <button onClick={handleUploadFileRequest} className="bg-green-500 px-2 font-bold text-gray-700"><CloudUploadIcon/> upload</button>
            </div>
          </div>
        </div>
      )}
     {activeUploaderFolder && (
  <div className="absolute z-20 bg-transparent w-[80%] h-[80vh] flex flex-col justify-center align-middle">
    <div className="m-auto w-[500px] h-[400px] bg-slate-200 rounded-md p-4">
      <button
        onClick={() => setActiveUploaderFolder(!activeUploaderFolder)}
        className="font-bold text-2xl px-3 py-2 rounded-lg w-[40px] bg-red-500 text-white"
      >
        X
      </button>
      
      <div style={{justifyContent:"center",alignItems:"center" }} className="flex flex-col justify-center align-middle mt-4 ">
        {/* MUI Input for folder name */}
        <Input
          label="Folder Name"
          variant="soft"
          sx={{width:"80%"}}
           placeholder="Enter your folder name..."
          onChange={(e) => SetFolderIs(e.target.value)}
          className="mb-4"
        />

       

        {/* MUI Button to submit */}
        <Button
          variant="soft"
          color="success"
          className="w-[300px] "
          onClick={()=>handleUploadFolderRequest(folderIs)}
        >
          Create Folder and Upload
        </Button>
      </div>
    </div>
  </div>
)}

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
      {/* <Alert severity="success">{alertMessage || "Success"}</Alert> */}
  <AlertInvertedColors msg={alertMessage}/>
        {Object.keys(investorData).map((key, index) => (
          <Button
            key={index}
            variant="solid"
            sx={{
              minWidth: "300px",
              maxWidth: "100%",
              textTransform: "capitalize",
              background: `${key !== activeTab && "#C7DFF7"}`,
            }}
            onClick={() => setActiveTab(key)}
          >
            {tempArr[index]}
          </Button>
        ))}
      </Box>
      <div>
        <Button color="success" variant="soft" sx={{mt:"30px",mb:"-10px"}} onClick={(e)=>uploadHandlerFolder(e,"newFolder")}>
          <span className="font-bold text-[20px] mr-1">+ </span> add new Sections
        </Button>
        <AccordionGroup
          sx={{
            minWidth: 400,
            width: "90%",
            marginTop: "40px",
            [`& .${accordionSummaryClasses.indicator}`]: {
              transition: "0.2s",
            },
            [`& [aria-expanded="true"] .${accordionSummaryClasses.indicator}`]: {
              transform: "rotate(45deg)",
            },
          }}
        >
          {investorData[activeTab] && investorData[activeTab].length > 0 ? (
            investorData[activeTab].map((key, id) => (
              <Accordion key={id}>
                <AccordionSummary
                  sx={{ border: "1px solid #C7DFF7", marginBottom: "10px" }}
                  indicator={<AddIcon />}
                  onClick={()=>{setActiveFDMain(key.title);console.log("here is fd",key.title)}}
                >
                  {key.title} 
                  <div className="absolute z-[30] w-[286px] right-[20px]  flex justify-evenly">
                  {/* 
                  <Button style={{zIndex:3}} variant="soft"  onClick={(e) => {
          e.stopPropagation(); 
          uploadHandlerFolder(e, key.title);
        }}
        > add sections</Button> */}

                  </div>
                </AccordionSummary>
                <AccordionDetails>
                
                  {key.items.map((element, id) => (
                    <Accordion key={id} className="relative z-[10]">
                      <AccordionSummary
                     
                        sx={{ border: "1px solid #C7DFF7", marginBottom: "10px" ,position:"relative" }}
                        indicator={<AddIcon />}
                        children={<CloudUploadIcon/>}
                      >
                        {key.title} 
                        <div className="absolute w-[400px] right-[40px]  flex justify-evenly ">

                       
                        <Button color="success" variant="soft" style={{zIndex:3}}  onClick={(e)=> uploadHandler(e,element)}> Uploads files</Button>
                        <Button color="danger" variant="soft" style={{zIndex:3}}  onClick={(e)=> deleteHandlerFolder(e,element)}> Delete section</Button>
                        <Button color="primary" variant="soft" style={{zIndex:3}}  onClick={(e)=> uploadHandlerEditing(e,element)}> Edit section</Button>
                       
                        </div>
                      </AccordionSummary>
                      {
                      element?.details?.map((data, id) => (
                        <AccordionDetails
                          onClick={() => callMeToEditFile(data, key.title)} // Pass key.title as folder name
                          className={`cursor-pointer ${mode === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`}
                          key={id}
                        >
                          {data.title}
                        </AccordionDetails>
                      ))}
                      {/* Details or further content here */}
                    </Accordion>
                  ))}
                </AccordionDetails>
              </Accordion>
            ))
          ) : (
            <p>Loading or No Data Available...</p>
          )}
        </AccordionGroup>
      </div>
    </div>
  );
};

export default Sustainability;


