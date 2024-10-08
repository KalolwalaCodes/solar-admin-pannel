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

const InvestorsRelation = () => {
  const { mode } = useColorScheme();

  const [investorData, setInvestorData] = useState({});
  const [activeTab, setActiveTab] = useState("announcements");
  const [activeEditor, setActiveEditor] = useState(false);
  const [activeUploader, setActiveUploader] = useState(false);
  const [dataToSetInEditor, setDataToSetInEditor] = useState();
  const [activeFD, setActiveFD] = useState();
  const [activeFDMain, setActiveFDMain] = useState();
  const[activeFolderNAme,setActiveFolderName]=useState();
  const [filesIs,setFiles]=useState();
  const [needToEdit, setNeedToEdit] = useState({
    need: false,
    value: ""
  });
  const tempArr = [
    "Announcements",
    "Stock Information",
    "Corporate Governance",
    "Financial Reporting",
  ];

  useEffect(() => {
    const fetchInvestorData = async () => {
      try {
        let res = await fetch("/admin-panel/Investor-relation");
        let data = await res.json();
        setInvestorData(data);
        console.log("here is ", data[activeTab][0]);
      } catch (error) {
        console.error("Error fetching investor data:", error);
      }
    };
    fetchInvestorData();
  }, [activeTab]);

  const callMeToEditFile = (data, folderName) => {
    setActiveEditor(!activeEditor);
    console.log(data);
    setDataToSetInEditor(data);
    setNeedToEdit({ need: false, value: "" }); // Resetting the edit state when opening the editor
    setActiveFolderName(folderName); // Call the function with folderName
  };

  const handleEditFileRequest = async (dataToSetInEditor) => {
    try {
      const previousFileName = dataToSetInEditor.title; // previous file name
      const category = activeTab; // active tab as the category
      const newFileName = needToEdit.value; // new file name from input
      const folderName = activeFolderNAme; // folder name from active folder
  
      const response = await fetch('/admin-panel/Investor-relation', {
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
        console.log('Failed to update file name');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const handleDeleteFileRequest = async (dataToSetInEditor) => {
    try {
      const fileName = dataToSetInEditor.title; // file name to delete
      const category = activeTab; // active tab as the category
      const folderName = activeFolderNAme; // folder name from active folder
  
      const response = await fetch('/admin-panel/Investor-relation', {
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
        console.log('Failed to delete file');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const uploadHandler=(e,element)=>{
    e.stopPropagation(); 
    setActiveFD(element.heading);
    // console.log(element.heading);
    setActiveUploader(true);
  }
  const handleUploadFileRequest = async () => {
    if (!filesIs || filesIs.length === 0) {
      console.log('No files selected');
      return;
    }
  
    const file = filesIs[0]; // Assuming only one file is uploaded at a time
  
    try {
      const itemsHeading = activeFD; // Use the uploaded file's name
      const category = activeTab;  // active tab as the category
      const folderName = activeFDMain; // folder name from active folder
      const fileName=file.name;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('itemsHeading', itemsHeading);
      formData.append('folderName', folderName);
      formData.append('category', category);
  
      const response = await fetch('/admin-panel/Investor-relation/upload-files', {
        method: 'POST',
        body: formData, // Use FormData for file upload
      });
     console.log(response,"here is respoense ");
      if (response.ok) {
        console.log('File uploaded successfully');
        
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
      }
    } catch (error) {
      console.error('Error:', error);
    }
    setActiveUploader(!activeUploader);
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
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
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
                </AccordionSummary>
                <AccordionDetails>
                
                  {key.items.map((element, id) => (
                    <Accordion key={id} className="relative z-[10]">
                      <AccordionSummary
                     
                        sx={{ border: "1px solid #C7DFF7", marginBottom: "10px" ,position:"relative" }}
                        indicator={<AddIcon />}
                        children={<CloudUploadIcon/>}
                      >
                        {element.heading}
                        <Button style={{zIndex:3}} className=" absolute right-[-35%]" onClick={(e)=> uploadHandler(e,element)}><CloudUploadIcon/></Button>
                    
                      </AccordionSummary>
                      {
                      element.details.map((data, id) => (
                        <AccordionDetails
                          onClick={() => callMeToEditFile(data, key.title)} // Pass key.title as folder name
                          className={`cursor-pointer ${mode == 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`}
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

export default InvestorsRelation;
