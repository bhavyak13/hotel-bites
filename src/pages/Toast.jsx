import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';

export const Toaster = (props) => {
    const {
        toastBody,
        toastVariant,
        toastHeaderContent
    } = props;
    return (
        <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1 }}>
            <Toast
                bg={toastVariant ? toastVariant.toLowerCase() : ''}
            >
                {toastHeaderContent &&
                    <Toast.Header>
                        {toastHeaderContent}
                    </Toast.Header>
                }
                {toastBody &&
                    <Toast.Body>{toastBody}</Toast.Body>
                }
            </Toast>
        </ToastContainer>
    );
}