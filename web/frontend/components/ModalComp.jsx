import {Button, Modal, TextContainer} from '@shopify/polaris';
import {useState, useCallback,useEffect} from 'react';

export default function ModalExample({polarisModel,setPolarisModel,handleDeleteBulkAction,polarisModelLoading,setPolarisModelLoading,singleDeleteData,setSingleDeleteData,handleDeleteRule,selectedResources}) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(polarisModel)
  }, [polarisModel])
  

  const handleChange = useCallback(() => {
    setActive(!active), 
    setPolarisModel(!polarisModel)
    // setPolarisModelLoading(!polarisModelLoading)
    setSingleDeleteData(null)
    selectedResources.length=0;
    [active,polarisModel,polarisModelLoading,singleDeleteData,selectedResources];
  })
  
  const singleDelete=()=>{
    singleDeleteData && handleDeleteRule(singleDeleteData)
  }
  return (
    <div style={{height: '500px'}}>
      <Modal
        open={active}
        onClose={handleChange}
        title="Are you sure you want to delete the rules?"
        primaryAction={{
          content: 'Delete',
          destructive:true,
          loading:polarisModelLoading,
          onAction: !singleDeleteData?handleDeleteBulkAction:singleDelete
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: handleChange,
          },
        ]}
      >
        <Modal.Section>
          <TextContainer>
            <p>
              This action can not be undone.
            </p>
          </TextContainer>
        </Modal.Section>
      </Modal>
    </div>
  );
}