// src/components/MapMarkerPopup.tsx
import React from 'react';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonImg,
  IonText,
  IonButton,
  IonIcon,
  IonSpinner
} from '@ionic/react';
import { close } from 'ionicons/icons';
import { supabase } from '../utils/supaBaseClient'; // Adjust path to your Supabase client
import '../CSS/MapMarkerPopup.css';

interface MapMarkerPopupProps {
  photoTagId: string;
  onClose: () => void;
}

const MapMarkerPopup: React.FC<MapMarkerPopupProps> = ({ photoTagId, onClose }) => {
  const [photoData, setPhotoData] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState<any>(null);
  const [photoTag, setPhotoTag] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Fetch photo tag data from database
        const { data: tagData, error: tagError } = await supabase
          .from('tagtbl')
          .select('*')
          .eq('tag_id', photoTagId)
          .single();

        if (tagError) {
          console.error('Error fetching photo tag:', tagError);
          setLoading(false);
          return;
        }

        if (!tagData) {
          setLoading(false);
          return;
        }

        setPhotoTag(tagData);

        // Fetch associated value info and form data
        const { data: valueInfoData, error: valueInfoError } = await supabase
          .from('value_info')
          .select(`
            *,
            formtbl (*)
          `)
          .eq('tag_id', photoTagId)
          .single();

        if (valueInfoError) {
          console.error('Error fetching value info:', valueInfoError);
        } else if (valueInfoData && valueInfoData.formtbl) {
          setFormData(valueInfoData.formtbl);
        }

        // Fetch photo from S3 bucket
        try {
          // Get signed URL for the photo from S3 bucket
          // Assuming photos are stored in tag-photos/{tag_id}/ folder
          const photoPath = `tag-photos/${photoTagId}/photo.jpg`; // Adjust path/extension as needed
          
          const { data: signedUrlData, error: signedUrlError } = await supabase
            .storage
            .from('tag-photos') // Your bucket name
            .createSignedUrl(photoPath, 60); // URL valid for 60 seconds

          if (signedUrlError) {
            console.error('Error generating signed URL:', signedUrlError);
          } else if (signedUrlData) {
            setPhotoData(signedUrlData.signedUrl);
          }
        } catch (photoError) {
          console.warn('Could not load photo from S3:', photoError);
        }

      } catch (error) {
        console.error('Error loading marker data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (photoTagId) {
      loadData();
    }
  }, [photoTagId]);

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="map-marker-popup-container">
        <IonCard className="map-marker-popup-card">
          <IonCardContent>
            <div className="popup-loading">
              <IonSpinner name="crescent" />
              <p>Loading property details...</p>
            </div>
          </IonCardContent>
        </IonCard>
      </div>
    );
  }

  if (!photoTag) {
    return (
      <div className="map-marker-popup-container">
        <IonCard className="map-marker-popup-card">
          <IonCardContent>
            <div className="popup-error">
              <p>No data found for this marker</p>
            </div>
          </IonCardContent>
        </IonCard>
      </div>
    );
  }

  return (
    <div className="map-marker-popup-container">
      <IonCard className="map-marker-popup-card">
        <IonCardHeader className="popup-header">
          <div className="popup-header-content">
            <IonCardTitle className="popup-title">Property Details</IonCardTitle>
            <IonButton
              fill="clear"
              size="small"
              onClick={onClose}
              className="popup-close-btn"
            >
              <IonIcon icon={close} slot="icon-only" />
            </IonButton>
          </div>
        </IonCardHeader>

        <IonCardContent className="popup-content">
          {/* Photo with fixed size container */}
          {photoData ? (
            <div className="popup-photo-container">
              <IonImg
                src={photoData}
                alt="Property photo"
                className="popup-photo"
              />
            </div>
          ) : (
            <div className="popup-photo-placeholder">
              <span>Photo not available</span>
            </div>
          )}

          {/* Form Data */}
          {formData ? (
            <div className="popup-form-data">
              <IonText>
                <p className="popup-data-item">
                  <strong>Form ID:</strong> {formData.form_id.substring(0, 8)}...
                </p>
                <p className="popup-data-item">
                  <strong>Kind ID:</strong> {formData.kind_id}
                </p>
                <p className="popup-data-item">
                  <strong>Class ID:</strong> {formData.class_id}
                </p>
                <p className="popup-data-item">
                  <strong>Area:</strong> {formData.area} m²
                </p>
                {formData.status && (
                  <p className="popup-data-item">
                    <strong>Status:</strong> {formData.status}
                  </p>
                )}
              </IonText>
            </div>
          ) : (
            <div className="popup-no-data">
              <IonText>
                <p className="popup-no-data-text">
                  No form data associated
                </p>
              </IonText>
            </div>
          )}

          {/* Photo Tag Info */}
          <div className="popup-meta-data">
            <IonText>
              <p className="popup-data-item meta">
                <strong>Date Taken:</strong> {formatDate(photoTag.date_taken || photoTag.created_at)}
              </p>
              <p className="popup-data-item meta">
                <strong>Location:</strong> {photoTag.latitude.toFixed(6)}, {photoTag.longitude.toFixed(6)}
              </p>
              {photoTag.accuracy && (
                <p className="popup-data-item meta">
                  <strong>Accuracy:</strong> ±{photoTag.accuracy.toFixed(1)}m
                </p>
              )}
              {photoTag.altitude && (
                <p className="popup-data-item meta">
                  <strong>Altitude:</strong> {photoTag.altitude.toFixed(1)}m
                </p>
              )}
            </IonText>
          </div>
        </IonCardContent>
      </IonCard>
    </div>
  );
};

export default MapMarkerPopup;