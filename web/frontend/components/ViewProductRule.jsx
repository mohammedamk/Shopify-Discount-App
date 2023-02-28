import {
   TextField,
   IndexTable,
   Card,
   Filters,
   Select,
   useIndexResourceState,
   // Text,
   Button,
   Checkbox
} from '@shopify/polaris';
import { useState, useCallback, useEffect } from 'react';
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch.js"
import ProductRule from "./ProductRule.jsx"
import { useDispatch } from "react-redux"
import { openToast } from '../redux/toastRedux.js';
import "./tableRule.css"
import ModalExample from './ModalComp.jsx';

const ViewProductRule = () => {
   const fetch = useAuthenticatedFetch()
   const dispatch = useDispatch();
   const [customers, setCustomers] = useState([])
   const resourceName = {
      singular: 'rule',
      plural: 'rules',
   };

   const [filteredWith, setFilteredWith] = useState('');
   const [queryValue, setQueryValue] = useState(null);
   const [sortValue, setSortValue] = useState('today');
   const [openModal, setOpenModal] = useState(false)
   const [isLoading, setIsLoading] = useState(false)
   const [whichBtnIsLoading, setWhichBtnIsLoading] = useState(false)
   const [updateData, setUpdateData] = useState({})
   const [endDate, setEndDate] = useState("")
   const [polarisModel,setPolarisModel]=useState(false)
   const [polarisModelLoading,setPolarisModelLoading]=useState(false)
   const [singleDeleteData, setSingleDeleteData] = useState(null)

   let bodyData;
   if (queryValue || sortValue) {
      bodyData = {
         action: "filter",
         queryValue,
         endDate
      }
   } else {
      bodyData = {
         action: "all"
      }
   }
   const getRules = async () => {
      // console.log("ppp",query)
      const response = await fetch("/api/getRules", {
         method: "POST",
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify({ ...bodyData })
      })
      if (response.status >= 200 && response.status <= 299) {
         const jsonData = await response.json()
         setCustomers(jsonData.data)
         
      }
      else {
         const jsonData = await response.json()
         // console.log(jsonData)
         dispatch(openToast({ error: true, message: "Something went wrong." }))
         setIsLoading(false)
         
      }
   }
   useEffect(() => {
      getRules()
   }, [])

   const resourceIDResolver = (products) => {
      return products._id
   };
   const { selectedResources, allResourcesSelected, handleSelectionChange } =
      useIndexResourceState(customers, {
         resourceIDResolver
      });


   const handleFilteredWithChange = useCallback(
      (value) => setFilteredWith(value),
      [],
   );

   const handleDeleteRule = async (query) => {
      setPolarisModelLoading(true)
      setWhichBtnIsLoading(query.id)
     
      const response = await fetch("/api/deleteRule", {
         method: "POST",
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify({
            data: query
         })
      })
      if (response.status >= 200 && response.status <= 299) {
         const jsonData = await response.json()
         // console.log(jsonData)
         dispatch(openToast({ error: false, message: "Rule deleted successfully." }))
         setWhichBtnIsLoading("")
         setPolarisModel(false)
         setPolarisModelLoading(false)
         setSingleDeleteData(null)
         selectedResources.length=0
         getRules()
         return true
      }
      else {
         const jsonData = await response.json()
         // console.log(jsonData)
         dispatch(openToast({ error: true, message: "Something went wrong." }))
         setWhichBtnIsLoading("")
         setPolarisModel(false)
         setSingleDeleteData(null)
         setPolarisModelLoading(false)
         selectedResources.length=0
         return false
      }



   }



   const handleFilteredWithRemove = useCallback(() => setFilteredWith(null), []);

   const handleQueryValueRemove = useCallback(() => setQueryValue(null), []);

   const handleClearAll = useCallback(() => {
      handleFilteredWithRemove();
      handleQueryValueRemove();
   }, [handleQueryValueRemove, handleFilteredWithRemove]);

   const handleSortChange = useCallback((value) => setSortValue(value), []);
   
   const handleDeleteBulkAction= async()=>{
      setPolarisModelLoading(true)
      const response=await fetch('/api/deleteSelected',{
         method:"POST",
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify({data:selectedResources})
      })
      if (response.status >= 200 && response.status <= 299) {
         const jsonData = await response.json()
         dispatch(openToast({ error: false, message: "Rules deleted successfully." }))
         setPolarisModel(false)
         setPolarisModelLoading(false)
         selectedResources.length=0
         getRules()
      }
      else {
         const jsonData = await response.json()
         // console.log(jsonData);
         dispatch(openToast({ error: true, message: "Something went wrong." }));
         setPolarisModel(false)
         selectedResources.length=0
         setPolarisModelLoading(false)
      }
   }

   const handleDeleteOpenModal=()=>{
      setPolarisModel(true);
   }
   const promotedBulkActions = [
      {
         content: 'Delete Rules',
         onAction: handleDeleteOpenModal
      },
   ];


   // const filters = [
   //    {
   //       key: 'filteredWith',
   //       label: 'Filtered with',
   //       filter: (
   //          <>
   //             <Checkbox
   //                label="percentage"
   //                checked={false}
   //                value={filteredWith}
   //                onChange={handleFilteredWithChange}
   //             />
   //             <Checkbox
   //                label="fixed"
   //                checked={false}
   //                value={filteredWith}
   //                onChange={handleFilteredWithChange}
   //             />
   //             <Checkbox
   //                label="percentage"
   //                checked={false}
   //                value={filteredWith}
   //                onChange={handleFilteredWithChange}
   //             />
   //          </>
   //       ),
   //       shortcut: true,
   //    },
   // ];
   const filters = []

   const appliedFilters = !isEmpty(filteredWith)
      ? [
         {
            key: 'filteredWith',
            label: disambiguateLabel('filteredWith', filteredWith),
            onRemove: handleFilteredWithRemove,
         },
      ]
      : [];

   const sortOptions = [
      { label: 'Today', value: 'today' },
      { label: 'Yesterday', value: 'yesterday' },
      { label: 'Last 7 days', value: 'lastWeek' },
   ];

   let rowMarkup;

   if (customers.length !== 0) {
      rowMarkup = (customers.length !== 0) && customers.map(
         ({ _id, product_A_id, product_A_name, product_B_id, product_B_name, product_B_Discount, title, price_A, price_B, ruleType, endDate, cartValue, cartQuantity,variant_A_id,variant_B_id}, index) => (
            <IndexTable.Row
               id={_id}
               key={_id}
               selected={selectedResources.includes(_id)}
               position={index}
            >
               <IndexTable.Cell>
                  {product_A_id}
               </IndexTable.Cell>
               <IndexTable.Cell>{product_A_name}</IndexTable.Cell>
               <IndexTable.Cell>{product_B_id}</IndexTable.Cell>
               <IndexTable.Cell>{product_B_name}</IndexTable.Cell>
               <IndexTable.Cell>{product_B_Discount.discountQuantity_B}</IndexTable.Cell>
               <IndexTable.Cell>{product_B_Discount.discountType_B}</IndexTable.Cell>
               <IndexTable.Cell>{product_B_Discount.discountCode_B}</IndexTable.Cell>
               <IndexTable.Cell>{cartValue}</IndexTable.Cell>
               <IndexTable.Cell>{cartQuantity}</IndexTable.Cell>
               <IndexTable.Cell>{endDate}</IndexTable.Cell>
               <IndexTable.Cell>
                  <div style={{ display: "flex", gap: "5px" }}>
                     <Button primary={true} onClick={() => { setOpenModal(true); setUpdateData({ _id, product_A_id, product_A_name, product_B_id, product_B_name, product_B_Discount, title, price_A, price_B, ruleType, endDate, cartValue, cartQuantity,variant_A_id,variant_B_id}) }}>Edit</Button>
                     <Button destructive={true} onClick={()=>{setSingleDeleteData({ id: _id, title: title, ruleType: ruleType}); handleDeleteOpenModal()}}id={title}>Delete</Button>
                  </div>
               </IndexTable.Cell>
            </IndexTable.Row>
         ),
      )
   }


   function disambiguateLabel(key, value) {
      switch (key) {
         case 'filteredWith':
            return `Filtered with ${value}`;
         default:
            return value;
      }
   }

   function isEmpty(value) {
      if (Array.isArray(value)) {
         return value.length === 0;
      } else {
         return value === '' || value == null;
      }
   }



   useEffect(() => {
      const timer = setTimeout(() => {
         getRules()
      }, 500)

      return () => clearTimeout(timer)
   }, [queryValue,endDate]);

   const handleEndChangeDate = useCallback((value) => {
      setEndDate(value)
   })
   
   const handleClearFilter=()=>{
      setEndDate("")
      setQueryValue("")
   }

   // console.log("SELECTED", customers)


   return (
      <>
         {!openModal ? <Card>
            <div style={{ padding: '16px', display: 'flex' }}>
               <div style={{ flex: 0.3 }}>
                  <p>Search</p>
                  <Filters
                     queryValue={queryValue}
                     filters={filters}
                     appliedFilters={appliedFilters}
                     onQueryChange={setQueryValue}
                     onQueryClear={handleQueryValueRemove}
                     onClearAll={handleClearAll}
                  />
               </div>
               {/* <div style={{paddingLeft: '0.25rem'}}>
          <Select
            labelInline
            label="Sort by"
            options={sortOptions}
            value={sortValue}
            onChange={handleSortChange}
          />
        </div> */}

               <div style={{ paddingLeft: '0.25rem', flex: 0.2 }}>
                  <p>Filtered By End Date</p>
                  <TextField
                     type="date"
                     value={endDate}
                     onChange={handleEndChangeDate}
                     autoComplete="off"
                  />
               </div>
               <div style={{ paddingLeft: '0.25rem', flex: 0.2 }}>
                  <p style={{visibility:"hidden"}}>Clear</p>
                  <Button primary onClick={handleClearFilter}>Clear</Button>
               </div>
            </div>
            <IndexTable
               resourceName={resourceName}
               itemCount={customers.length !== 0 && customers.length}
               selectedItemsCount={
                  allResourcesSelected ? 'All' : selectedResources.length
               }
               onSelectionChange={handleSelectionChange}
               hasMoreItems
               promotedBulkActions={promotedBulkActions}
               lastColumnSticky
               headings={[
                  { title: 'Product-A-ID' },
                  { title: 'Product-A-Name' },
                  { title: 'Product-B-ID' },
                  { title: 'Product-B-Name' },
                  { title: 'DiscountValue-B' },
                  { title: 'DiscountType-B' },
                  { title: 'DiscountCode-B' },
                  { title: 'Cart-Value' },
                  { title: 'Cart-Quantity' },
                  { title: 'Discount-End-Date' },
                  { title: "Action" }
               ]}
            >
               {rowMarkup}
            </IndexTable>
         </Card> :
            <ProductRule back={openModal} setBack={setOpenModal} updateData={updateData} getRules={getRules}
               handleDeleteRule={handleDeleteRule} selectedResources={selectedResources}/>
         }
         <ModalExample polarisModel={polarisModel} setPolarisModel={setPolarisModel} handleDeleteBulkAction={handleDeleteBulkAction} polarisModelLoading={polarisModelLoading} setPolarisModelLoading={setPolarisModelLoading}
         singleDeleteData={singleDeleteData} setSingleDeleteData={setSingleDeleteData} handleDeleteRule={handleDeleteRule} selectedResources={selectedResources}/>
      </>
   )
};

export default ViewProductRule;