import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonContent } from '@ionic/react';
import { documentOutline } from 'ionicons/icons';

const People: React.FC = () => {

    const tabs = [
        { name: 'Declarant', tab: 'declarant', url: '/menu/people/declarant', icon: documentOutline},
    ]
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                {/* Content will go here later */}
            </IonContent>
        </IonPage>
    );
};

export default People;