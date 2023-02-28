import ProductRule from "../components/ProductRule.jsx";

import ViewProductRule from "../components/ViewProductRule";

import Toast from "../components/Toast.jsx"
import { Card, Tabs,Frame 
} from '@shopify/polaris';
import { useState, useCallback,useEffect } from 'react';
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch.js";


function Index() {

  const [selected, setSelected] = useState(0);
  const [page, setPage] = useState('/');
  const fetch=useAuthenticatedFetch()

  const handleTabChange = (index) => {
    setSelected(index);
    setPage(tabs[index].page);
  }


  const tabs = [
    {
      id: 'ViewProductRule',
      content: 'View Products Rules',
      panelID: 'ViewProductRule',
      page: '/viewproductrule'
    },
    {
      id: 'AddProductRule',
      content: 'Add Product Rule',
      panelID: 'AddProductRule',
      page: '/addproductrule'
    },
   
  
  ];

  let PageMarkup = ViewProductRule;

  switch (page) {
    case '/addproductrule':
      PageMarkup = ProductRule;
      break;
    case '/viewproductrule':
      PageMarkup = ViewProductRule;
      break;
    default:
      PageMarkup = ViewProductRule;
      break;
  }


  useEffect(() => {
    const scriptAdd= async()=>{
        const scriptAdd = await fetch('/api/script/create')
        .then(response => response.json())
        .catch(error => console.log("error", error));
        //  console.log("scriptAdd", scriptAdd);
    }
    scriptAdd()
}, [])

  return (
    <>
    <Frame>
      <div>
        <Card>
          <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}>
            <PageMarkup />
          </Tabs>
          <Toast/>
        </Card>
      </div>
      </Frame>
    
    </>
  )
}


export default Index;