import {
    Card,
    Heading,
    TextContainer,
    DisplayText,
    TextStyle,
    FormLayout,
    TextField,
    Button,
    ChoiceList,
    Page,
    Layout,
    DatePicker,
    Form
} from "@shopify/polaris";
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch.js"

import { Provider, ResourcePicker } from '@shopify/app-bridge-react'

import { useState, useCallback, useEffect, useReducer } from 'react';
import {useDispatch} from "react-redux"
import { openToast } from "../redux/toastRedux.js";

const initialTodos = {
    product_A: {
        product_A_id: '',
        product_A_name: '',
        price_A: '',
        isInvalid: false,
        value: false
    },
    product_B: {
        product_B_id: '',
        product_B_name: "",
        price_B: '',
        isInvalid: false,
        value: false
    },
    discountType: {
        discountType_B: "",
        isInvalid: false,
        value: false
    },
    discountValue: {
        discountQuantity_B: "",
        isInvalid: false,
        value: false
    },
    discountCode: {
        discountCode_B: "",
        isInvalid: false,
        value: false
    },
    ruleType: {
        ruleType: ["discount"],
        isInvalid: false,
        value: true
    },


};

const reducer = (state, action) => {
    switch (action.type) {
        case 'A':
            return {
                ...state,
                product_A: {
                    product_A_id: action.productId,
                    variant_A_id:action.variantId,
                    product_A_name: action.productTitle,
                    price_A: action.price,
                    isInvalid: false,
                    value: action.productId
                }
            }
        case 'product_A_Validate':
            state.product_A.isInvalid = action.isInvalid
            return {
                ...state
            }
        case 'B':
            return {
                ...state,
                product_B: {
                    product_B_id: action.productId,
                    variant_B_id:action.variantId,
                    product_B_name: action.productTitle,
                    price_B: action.price,
                    isInvalid: false,
                    value: action.productId
                }
            }
        case 'product_B_Validate':
            state.product_B.isInvalid = action.isInvalid
            return {
                ...state
            }
        case 'ruleType':
            return {
                ...state,
                ruleType: {
                    ruleType: action.value,
                    isInvalid: false,
                    value: action.value
                },

            }
        // case 'ruleType_Validate':
        //     state.ruleType.isInvalid=action.isInvalid
        //     return {
        //         ...state 
        //     }
        case 'discountCode':
            return {
                ...state,
                discountCode: {
                    discountCode_B: action.value,
                    isInvalid: false,
                    value: action.value
                },

            }
        case 'discountCode_Validate':
            state.discountCode.isInvalid = action.isInvalid
            return {
                ...state
            }
        case 'discountType':
            return {
                ...state,
                discountType: {
                    discountType_B: action.value,
                    isInvalid: false,
                    value: action.value
                },

            }
        case 'discountType_Validate':
            state.discountType.isInvalid = action.isInvalid
            return {
                ...state
            }
        case 'discountValue':
            return {
                ...state,
                discountValue: {
                    discountQuantity_B: action.value,
                    isInvalid: false,
                    value: action.value
                },

            }
        case 'discountValue_Validate':
            state.discountValue.isInvalid = action.isInvalid
            return {
                ...state
            }
        case 'clear':
            return {
                product_A: {
                    product_A_id: '',
                    product_A_name: '',
                    price_A: '',
                    isInvalid: false,
                    value: false
                },
                product_B: {
                    product_B_id: '',
                    product_B_name: "",
                    price_B: '',
                    isInvalid: false,
                    value: false
                },
                discountType: {
                    discountType_B: "",
                    isInvalid: false,
                    value: false
                },
                discountValue: {
                    discountQuantity_B: "",
                    isInvalid: false,
                    value: false
                },
                discountCode: {
                    discountCode_B: "",
                    isInvalid: false,
                    value: false
                },
                ruleType: {
                    ruleType: ["discount"],
                    isInvalid: false,
                    value: true
                },


            }
        default:
            return state;
    }
};

const ProductRule = ({ back, setBack, updateData, getRules, handleDeleteRule,selectedResources}) => {
    const fetch = useAuthenticatedFetch()

    const [todos, dispatch] = useReducer(reducer, initialTodos);
    // console.log('todos', todos);
    const reduxDispatch=useDispatch();


    const [isLoading, setIsLoading] = useState(false)
    const [openResource, setOpenResource] = useState(false);
    const [resourceAction, setResourceAction] = useState("")
    const [endDate, setEndDate] = useState("")
    const [cartValue, setCartValue] = useState(0)
    const [cartQuantity, setCartQuantity] = useState(0)
    const [initialQueryPicker, setInitialQueryPicker] = useState("")

    const handleCartValueChange=useCallback(
        (value)=>{
             setCartValue(value)
        }
    )
    
    const handleCartQuantityChange=useCallback(
        (value)=>{
             setCartQuantity(value)
        }
    )

    const handleChangeRuleType = useCallback(
        (value) => {
            dispatch({ type: "ruleType", value })
        }
    )




    const handleEndChangeDate = useCallback(
        (value) => {
            setEndDate(value)
        }
    )



    const handleChangedDiscountQuantityB = useCallback(
        (value) => {
            dispatch({ type: "discountValue", value })
        }
    )

    const handleChangeDiscountTypeB = useCallback(
        (value) => {
            dispatch({ type: "discountType", value })
        }
    )

    const handleDiscountCodeChangeB = useCallback(
        (value) => {
            dispatch({ type: "discountCode", value })
        }
    )
    const handleCancelPicker = () => {
        setOpenResource(false)
    }
    const handleSelectPicker = (resource) => {
        // console.log("resource", resource)
        const productId = resource.selection[0].id.split("/")[4];
        const productTitle = resource.selection[0].title
        const price = resource.selection[0].variants[0].price;
        const variantId=resource.selection[0].variants[0].id.split("/")[4]

        dispatch({
            type: resourceAction,
            productId,
            productTitle,
            variantId,
            price
        })
        setOpenResource(false)
    }
    const handleOpenResource = (action) => {
        setResourceAction(action)
        setOpenResource(true)
    }
    const config = {
        apiKey: `${process.env.SHOPIFY_API_KEY}`,
        host: new URLSearchParams(location.search).get("host"),
        forceRedirect: true
    };

    const validateFunction = async () => {
        let isAnyInvalid = false;

        if (todos?.ruleType?.ruleType[0] === 'discount') {
            for (const [key, value] of Object.entries(todos)) {
                if (!value.value) {
                    isAnyInvalid = true
                    dispatch({
                        type: `${key}_Validate`,
                        isInvalid: true
                    })
                }
            }
            if (!isAnyInvalid) {
                if (todos?.discountType?.discountType_B[0] === 'percentage') {
                    if (!(1 <= Number(todos?.discountValue?.discountQuantity_B) && Number(todos?.discountValue?.discountQuantity_B) <= 100)) {
                        isAnyInvalid = true
                        dispatch({
                            type: `discountValue_Validate`,
                            isInvalid: true
                        })
                    }
                } else {
                    if (!((0.01 * Number(todos?.product_B?.price_B)) <= Number(todos?.discountValue?.discountQuantity_B)
                        && Number(todos?.discountValue?.discountQuantity_B) <= Number(todos?.product_B?.price_B))) {
                        isAnyInvalid = true
                        dispatch({
                            type: `discountValue_Validate`,
                            isInvalid: true
                        })
                    }
                }
            }
        } else {
            if (!(todos?.product_A?.value)) {
                isAnyInvalid = true
                dispatch({
                    type: `product_A_Validate`,
                    isInvalid: true
                })
            }
            if (!(todos?.product_B?.value)) {
                isAnyInvalid = true
                dispatch({
                    type: `product_B_Validate`,
                    isInvalid: true
                })
            }
        }

        if (isAnyInvalid) {
            return false;
        } else {
            return true;
        }
    }

    
    const handleSubmit = async () => {
        const isProceed = await validateFunction();
        if (isProceed) {
            setIsLoading(true);

            const response = await fetch("/api/saveRuleData", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...todos?.product_A, ...todos?.product_B,
                    product_B_Discount: { discountQuantity_B: todos?.discountValue?.discountQuantity_B, discountType_B: todos?.discountType?.discountType_B[0], discountCode_B: todos?.discountCode?.discountCode_B }, endDate,cartQuantity:Number(cartQuantity)?Number(cartQuantity):0,cartValue:Number(cartValue)?Number(cartValue):0,
                    ruleType: todos?.ruleType?.ruleType[0]
                })
            })
            if (response.status >= 200 && response.status <= 299) {
                const jsonData = await response.json()
                // console.log(jsonData)
                reduxDispatch(openToast({error:false,message:"Rule created successfully."}))
                dispatch({ type: "clear" })
                setIsLoading(false);
                return true
            }
            else {
                const jsonData = await response.json()
                reduxDispatch(openToast({error:true,message:jsonData.error}))
                // console.log(jsonData)
                setIsLoading(false)
                return false
            }

        }
    }

    const handleUpdateSubmit = async () => {
        // console.log("nnnnnnnnn", updateData)
        let isProceed=false;
        let isProceedUpdate = false;
        isProceed = await validateFunction();
        if(isProceed){
            setIsLoading(true);
        if (updateData.ruleType === "discount" && todos.ruleType.ruleType[0] === "noDiscount") {
            isProceedUpdate = await handleDeleteRule({  id: updateData._id, title: updateData.title,ruleType:updateData.ruleType })
            const responseD = isProceedUpdate &&  await handleSubmit();
            if(responseD){
            setIsLoading(false);
            dispatch({ type: "clear" })
            setBack(false)
            getRules()
            selectedResources.length=0
            return;
            }
        }else if(updateData.ruleType === "noDiscount" && todos.ruleType.ruleType[0] === "discount"){
            setIsLoading(true)
            isProceedUpdate = await handleDeleteRule({  id: updateData._id, title: updateData.title,ruleType:updateData.ruleType })
            const responsenoD = isProceedUpdate &&  await handleSubmit();
            if(responsenoD){
            setIsLoading(false);
            dispatch({ type: "clear" })
            setBack(false)
            getRules()
            selectedResources.length=0
            return;
            }
        }else{
            isProceedUpdate=true;
        }
    }
        if (isProceedUpdate) {
            setIsLoading(true)
            const response = await fetch("/api/updateRuleData", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    _id: updateData?._id,
                    ...todos?.product_A, ...todos?.product_B,
                    product_B_Discount: { discountQuantity_B: todos?.discountValue?.discountQuantity_B, discountType_B: todos?.discountType?.discountType_B[0], discountCode_B: todos?.discountCode?.discountCode_B }, endDate,cartQuantity:Number(cartQuantity)?Number(cartQuantity):0,cartValue:Number(cartValue)?Number(cartValue):0,
                    ruleType: todos?.ruleType?.ruleType[0],
                    title: updateData?.title, old_product_A_id: updateData?.product_A_id, old_product_B_id: updateData?.product_B_id,
                })
            })
            if (response.status >= 200 && response.status <= 299) {
                const jsonData = await response.json()
                // console.log(jsonData)
                reduxDispatch(openToast({error:false,message:"Rule updated successfully."}))
                setIsLoading(false);
                dispatch({ type: "clear" })
                setBack(false)
                getRules()
                selectedResources.length=0
            }
            else {
                const jsonData = await response.json()
                // console.log(jsonData)
                reduxDispatch(openToast({error:true,message:"Something went wrong"}))
                setBack(false)
                getRules()
                selectedResources.length=0
                setIsLoading(false)
                dispatch({ type: "clear" })
            }
        }
    }

    updateData && useEffect(() => {
        dispatch({
            type: "A",
            productId: updateData?.product_A_id,
            variantId:updateData?.variant_A_id,
            productTitle: updateData?.product_A_name,
            price: updateData?.price_A
        })
        dispatch({
            type: "B",
            productId: updateData?.product_B_id,
            variantId:updateData?.variant_B_id,
            productTitle: updateData?.product_B_name,
            price: updateData?.price_B
        })
        dispatch({ type: "ruleType", value: [updateData?.ruleType] })
        dispatch({ type: "discountValue", value: updateData?.product_B_Discount?.discountQuantity_B });
        dispatch({ type: "discountType", value: [updateData?.product_B_Discount?.discountType_B] })
        dispatch({ type: "discountCode", value: updateData?.product_B_Discount?.discountCode_B })
        setEndDate(updateData?.endDate)
        setCartQuantity(updateData?.cartQuantity)
        setCartValue(updateData?.cartValue)
    }, [updateData])
    
    
    
  
    return (
        <>
            <Page narrowWidth>
                <Layout>
                    <Layout.Section>
                        <Card sectioned>
                            <Provider config={config}>
                                <ResourcePicker resourceType="Product" open={openResource} selectMultiple={false} onSelection={handleSelectPicker}  onCancel={handleCancelPicker} />
                            </Provider>
                            {back && <Button onClick={() => setBack(false)} primary={true}>Back</Button>}
                            {!back ? <Heading>Create A Product Based Discount Rule</Heading> : <Heading>Update Product Based Discount Rule</Heading>}
                            <FormLayout>
                                <TextField
                                    type="text"
                                    label="Mandatory Product"
                                    autoComplete="off"
                                    error={todos?.product_A?.isInvalid ? "Product is required." : ""}
                                    helpText="Choose the product by clicking on Choose Product button."
                                    value={todos?.product_A?.product_A_name}
                                />
                                <Button onClick={() => handleOpenResource("A")} primary={true}>Choose Product</Button>
                                <TextField
                                    type="text"
                                    label="Discounted Product"
                                    autoComplete="off"
                                    helpText="Choose the product by clicking on Choose Product button."
                                    error={todos?.product_B?.isInvalid ? "Product is required" : ""}
                                    value={todos?.product_B?.product_B_name}
                                />
                                <Button onClick={() => handleOpenResource("B")} primary={true}>Choose Product</Button>

                                <ChoiceList
                                    title="Rule Type"
                                    choices={[
                                        { label: 'With Discount', value: 'discount' },
                                        { label: 'WithOut Discount', value: 'noDiscount' },
                                    ]}
                                    selected={todos?.ruleType?.ruleType}
                                    onChange={handleChangeRuleType}
                                    error={todos?.ruleType?.isInvalid ? "Rule type is required." : ""}
                                />
                                {todos.ruleType.ruleType[0] === 'discount' && <ChoiceList
                                    title="Discount Type"
                                    choices={[
                                        { label: 'Percentage', value: 'percentage' },
                                        { label: 'Fixed Value', value: 'fixed' },
                                    ]}
                                    selected={todos?.discountType?.discountType_B}
                                    onChange={handleChangeDiscountTypeB}
                                    error={todos?.discountType?.isInvalid ? "Discount type is required." : ""}
                                />}
                                {todos.ruleType.ruleType[0] === 'discount' && <TextField
                                    type="text"
                                    label="Discount Code"
                                    autoComplete="off"
                                    value={todos?.discountCode?.discountCode_B}
                                    onChange={handleDiscountCodeChangeB}
                                    error={todos?.discountCode?.isInvalid ? "Discount code is required" : ""}
                                />}
                                {(todos.ruleType.ruleType[0] === 'discount' && todos.discountType.discountType_B[0]) && <TextField
                                    label="Discounted Value"
                                    type="number"
                                    value={todos?.discountValue?.discountQuantity_B}
                                    onChange={handleChangedDiscountQuantityB}
                                    autoComplete="off"
                                    helpText={todos.discountType.discountType_B[0] === "percentage" ? `Discount value must lie in between 1 to 100` : `Discount value must lie in between ${0.01 * Number(todos.product_B.price_B)} to ${Number(todos.product_B.price_B)}`}
                                    error={todos?.discountValue?.isInvalid ? "Discount Value is required in specified range." : ""}
                                />}
                                <TextField
                                    label="Cart Total Value"
                                    type="number"
                                    value={cartValue}
                                    onChange={handleCartValueChange}
                                    autoComplete="off"

                                />
                                <TextField
                                    label="Cart Quantity"
                                    type="number"
                                    value={cartQuantity}
                                    onChange={handleCartQuantityChange}
                                    autoComplete="off"

                                />
                                <TextField
                                    label="Discount End Date"
                                    type="date"
                                    value={endDate}
                                    onChange={handleEndChangeDate}
                                    autoComplete="off"

                                />
                                {!back && <Button onClick={() => handleSubmit()} loading={isLoading} primary={true}>
                                    Add Rule</Button>}
                                {back && <Button onClick={handleUpdateSubmit} loading={isLoading} primary={true}>
                                    Update Rule</Button>}
                            </FormLayout>
                        </Card>
                    </Layout.Section>
                </Layout>
            </Page>
        </>
    )
}

export default ProductRule