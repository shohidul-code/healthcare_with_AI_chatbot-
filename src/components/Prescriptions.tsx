import React, { useState, useEffect } from 'react';
import { Upload, FileText, Download, Eye, X, CheckCircle, AlertCircle } from 'lucide-react';
import { PrescriptionService, DoctorService } from '../services/firebase';
import { Prescription, Doctor } from '../types/firebase';
import { useAuth } from '../contexts/AuthContext';
import { 
  fileToBase64, 
  downloadFileFromBase64, 
  formatFileSize, 
  validateFile, 
  generateDocumentId,
  prepareFileForUpload 
} from '../utils/fileUtils';

interface PrescriptionWithDoctor extends Prescription {
  id: string;
  doctorDetails?: Doctor;
}

export default function Prescriptions() {
  const { currentUser } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [prescriptions, setPrescriptions] = useState<PrescriptionWithDoctor[]>([]);
  const [doctors, setDoctors] = useState<Record<string, Doctor>>({});
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<PrescriptionWithDoctor | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    type: '',
    status: '',
    instructions: '',
    notes: ''
  });
  const [formData, setFormData] = useState({
    type: '',
    doctorId: '',
    date: '',
    notes: ''
  });

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setLoadingDoctors(true);
        console.log('Loading doctors...');
        const doctorsData = await DoctorService.getAllDoctors();
        setDoctors(doctorsData);
      } catch (error) {
        console.error('Error loading doctors:', error);
      } finally {
        setLoadingDoctors(false);
      }
    };

    const loadPrescriptions = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Loading prescriptions for patient:', currentUser.uid);
        const prescriptionsData = await PrescriptionService.getUserPrescriptions(currentUser.uid);
        
        // Convert to array and add doctor details
        const prescriptionsArray = await Promise.all(
          Object.entries(prescriptionsData).map(async ([id, prescription]) => {
            try {
              const doctorDetails = await DoctorService.getDoctor(prescription.doctorId);
              return {
                ...prescription,
                id,
                doctorDetails: doctorDetails || undefined
              };
            } catch (error) {
              console.error('Error loading doctor details:', error);
              return {
                ...prescription,
                id
              };
            }
          })
        );

        setPrescriptions(prescriptionsArray);
      } catch (error) {
        console.error('Error loading prescriptions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDoctors();
    loadPrescriptions();

    // Set up real-time listener
    const unsubscribe = currentUser ? PrescriptionService.onUserPrescriptionsChange(currentUser.uid, async (prescriptionsData) => {
      if (prescriptionsData) {
        const prescriptionsArray = await Promise.all(
          Object.entries(prescriptionsData).map(async ([id, prescription]) => {
            try {
              const doctorDetails = await DoctorService.getDoctor(prescription.doctorId);
              return {
                ...prescription,
                id,
                doctorDetails: doctorDetails || undefined
              };
            } catch (error) {
              return {
                ...prescription,
                id
              };
            }
          })
        );
        setPrescriptions(prescriptionsArray);
      } else {
        setPrescriptions([]);
      }
    }) : () => {};

    return unsubscribe;
  }, [currentUser]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadError(null);
      
      // Prepare file for upload (includes validation and compression)
      const preparation = await prepareFileForUpload(file);
      if (!preparation.success) {
        setUploadError(preparation.error || 'Invalid file');
        setSelectedFile(null);
        return;
      }
      
      setSelectedFile(preparation.file || file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpload = async () => {
    if (!currentUser) {
      setUploadError('Please log in to upload prescriptions');
      return;
    }

    if (!selectedFile || !formData.type || !formData.doctorId || !formData.date) {
      setUploadError('Please fill in all required fields and select a file');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      setUploadError(null);
      setUploadSuccess(false);

      // Convert file to base64
      setUploadProgress(25);
      const base64Content = await fileToBase64(selectedFile);
      
      setUploadProgress(40);
      
      setUploadProgress(50);
      
      // Generate unique document ID
      const documentId = generateDocumentId();
      
      const prescription = {
        doctorId: formData.doctorId,
        appointmentId: '', // Could be linked to an appointment
        prescriptionDetails: {
          title: `${formData.type} - ${new Date(formData.date).toLocaleDateString()}`,
          type: formData.type as any,
          status: 'active' as const,
          prescribedDate: formData.date,
          expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 months from now
          instructions: formData.notes || 'Follow doctor\'s instructions'
        },
        medications: {},
        documents: {
          [documentId]: {
            fileName: selectedFile.name,
            fileUrl: '', // Keep for backward compatibility
            fileContent: base64Content, // Store actual file content
            fileType: selectedFile.type,
            fileSize: formatFileSize(selectedFile.size),
            uploadedAt: new Date().toISOString(),
            uploadedBy: currentUser.uid
          }
        },
        timestamps: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        notes: formData.notes
      };

      setUploadProgress(75);
      await PrescriptionService.createPrescription(currentUser.uid, prescription);
      
      setUploadProgress(100);
      setUploadSuccess(true);
      
      // Reset form after a short delay
      setTimeout(() => {
        setSelectedFile(null);
        setFormData({
          type: '',
          doctorId: '',
          date: '',
          notes: ''
        });
        
        // Reset file input
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
        
        setUploadProgress(0);
        setUploadSuccess(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error uploading prescription:', error);
      setUploadError('Failed to upload prescription. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'medication':
        return '💊';
      case 'lab-report':
        return '🧪';
      case 'x-ray':
        return '🦴';
      case 'blood-test':
        return '🩸';
      default:
        return '📄';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      return dateString;
    }
  };

  const handleViewPrescription = (prescription: PrescriptionWithDoctor) => {
    setSelectedPrescription(prescription);
    setIsViewModalOpen(true);
  };

  const handleEditPrescription = (prescription: PrescriptionWithDoctor) => {
    setSelectedPrescription(prescription);
    setEditFormData({
      title: prescription.prescriptionDetails.title,
      type: prescription.prescriptionDetails.type,
      status: prescription.prescriptionDetails.status,
      instructions: prescription.prescriptionDetails.instructions,
      notes: prescription.notes || ''
    });
    setIsEditModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsViewModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedPrescription(null);
    setEditFormData({
      title: '',
      type: '',
      status: '',
      instructions: '',
      notes: ''
    });
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveChanges = async () => {
    if (!selectedPrescription || !currentUser) return;

    try {
      // Update prescription in Firebase
      await PrescriptionService.updatePrescriptionStatus(
        currentUser.uid,
        selectedPrescription.id, 
        editFormData.status as any
      );

      // Update local state
      setPrescriptions(prev => 
        prev.map(prescription => 
          prescription.id === selectedPrescription.id 
            ? {
                ...prescription,
                prescriptionDetails: {
                  ...prescription.prescriptionDetails,
                  title: editFormData.title,
                  type: editFormData.type as any,
                  status: editFormData.status as any,
                  instructions: editFormData.instructions
                },
                notes: editFormData.notes
              }
            : prescription
        )
      );

      alert('Prescription updated successfully!');
      handleCloseModals();
    } catch (error) {
      console.error('Error updating prescription:', error);
      alert('Failed to update prescription. Please try again.');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold mb-4">Prescription Management</h1>
          <p className="text-xl text-blue-100">Upload, view, and manage your prescriptions and medical documents</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Upload New Prescription</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prescription Type:</label>
                <select 
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Type</option>
                  <option value="medication">Medication</option>
                  <option value="lab-report">Lab Report</option>
                  <option value="x-ray">X-Ray</option>
                  <option value="blood-test">Blood Test</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prescribed by:</label>
                {loadingDoctors ? (
                  <div className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 text-gray-500">
                    Loading doctors...
                  </div>
                ) : (
                  <select 
                    name="doctorId"
                    value={formData.doctorId}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Doctor</option>
                    {Object.entries(doctors).map(([doctorId, doctor]) => (
                      <option key={doctorId} value={doctorId}>
                        {doctor.profile.name} - {doctor.profile.specialty} ({doctor.profile.department})
                      </option>
                    ))}
                  </select>
                )}
                {formData.doctorId && doctors[formData.doctorId] && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start space-x-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-blue-900">{doctors[formData.doctorId].profile.name}</h4>
                        <p className="text-sm text-blue-700">{doctors[formData.doctorId].profile.specialty}</p>
                        <p className="text-sm text-blue-600">{doctors[formData.doctorId].profile.department} • {doctors[formData.doctorId].profile.experience}</p>
                        <p className="text-xs text-blue-500 mt-1">{doctors[formData.doctorId].profile.qualification}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1">
                          <span className="text-yellow-500">★</span>
                          <span className="text-sm font-medium text-blue-900">{doctors[formData.doctorId].stats.rating}</span>
                        </div>
                        <p className="text-xs text-blue-600">{doctors[formData.doctorId].stats.reviewCount} reviews</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date:</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Document:</label>
                <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
                  uploadError ? 'border-red-300 bg-red-50' : 
                  uploadSuccess ? 'border-green-300 bg-green-50' :
                  'border-gray-300 hover:border-blue-400'
                }`}>
                  {uploadSuccess ? (
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  ) : uploadError ? (
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  ) : (
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  )}
                  
                  {uploadSuccess ? (
                    <div className="text-lg font-medium text-green-600 mb-2">Upload Successful!</div>
                  ) : uploadError ? (
                    <div className="text-lg font-medium text-red-600 mb-2">Upload Failed</div>
                  ) : (
                    <div className="text-lg font-medium text-gray-600 mb-2">Drag & Drop Files Here</div>
                  )}
                  
                  {uploadError && (
                    <div className="text-sm text-red-600 mb-4 p-3 bg-red-100 rounded-lg border border-red-200">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{uploadError}</span>
                      </div>
                    </div>
                  )}
                  
                  {!uploadSuccess && !uploadError && (
                    <div className="text-sm text-gray-500 mb-4">or click to browse files</div>
                  )}
                  
                  {!uploadSuccess && (
                    <>
                      <input
                        type="file"
                        onChange={handleFileSelect}
                        accept=".pdf,.jpg,.jpeg,.png,.docx,.doc"
                        className="hidden"
                        id="file-upload"
                        disabled={uploading}
                      />
                      <label
                        htmlFor="file-upload"
                        className={`cursor-pointer px-4 py-2 rounded-lg transition-colors duration-200 inline-block ${
                          uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                        } text-white`}
                      >
                        {uploading ? 'Uploading...' : 'Browse Files'}
                      </label>
                    </>
                  )}
                  
                  {selectedFile && !uploadSuccess && (
                    <div className="mt-3 text-sm text-gray-600">
                      Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                    </div>
                  )}
                  
                  {uploading && (
                    <div className="mt-4">
                      <div className="bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-600">
                        Uploading... {uploadProgress}%
                      </div>
                    </div>
                  )}
                  
                  {!uploadSuccess && (
                    <div className="text-xs text-gray-400 mt-2">
                      Supported formats: PDF, JPG, PNG, DOCX, DOC (Max: 10MB)
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes:</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Any additional information about this prescription..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                ></textarea>
              </div>
              
              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading || uploadSuccess}
                className={`w-full py-3 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  uploadSuccess ? 'bg-green-600 text-white' : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {uploading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Uploading... {uploadProgress}%</span>
                  </div>
                ) : uploadSuccess ? (
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Uploaded Successfully!</span>
                  </div>
                ) : (
                  'Upload Prescription'
                )}
              </button>
            </div>
          </div>

          {/* Recent Prescriptions */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Recent Prescriptions</h3>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading prescriptions...</p>
              </div>
            ) : prescriptions.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No prescriptions found</p>
                <p className="text-gray-500 text-sm">Upload your first prescription above</p>
              </div>
            ) : (
              <div className="space-y-4">
                {prescriptions.map((prescription) => (
                  <div 
                    key={prescription.id} 
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                    onClick={() => handleViewPrescription(prescription)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl">{getTypeIcon(prescription.prescriptionDetails.type)}</div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{prescription.prescriptionDetails.title}</h4>
                          <p className="text-blue-600 text-sm">
                            {prescription.doctorDetails?.profile.name || 'Doctor'} - {prescription.doctorDetails?.profile.specialty || 'Specialty'}
                          </p>
                          <p className="text-gray-500 text-sm">{formatDate(prescription.prescriptionDetails.prescribedDate)}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              getStatusColor(prescription.prescriptionDetails.status)
                            }`}>
                              {prescription.prescriptionDetails.type.charAt(0).toUpperCase() + prescription.prescriptionDetails.type.slice(1).replace('-', ' ')}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              getStatusColor(prescription.prescriptionDetails.status)
                            }`}>
                              {prescription.prescriptionDetails.status.charAt(0).toUpperCase() + prescription.prescriptionDetails.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewPrescription(prescription);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            const document = Object.values(prescription.documents)[0];
                            if (document?.fileContent) {
                              downloadFileFromBase64(
                                document.fileContent,
                                document.fileName,
                                document.fileType
                              );
                            } else if (document?.fileUrl) {
                              // Fallback for old documents
                              window.open(document.fileUrl, '_blank');
                            }
                          }}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Pagination */}
            {prescriptions.length > 0 && (
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                <button className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200">
                  Previous
                </button>
                <span className="text-sm text-gray-600">Page 1 of 1</span>
                <button className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200">
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View Prescription Modal */}
      {isViewModalOpen && selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Prescription Details</h2>
              <button 
                onClick={handleCloseModals}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Prescription Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Prescription Information</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Title:</label>
                    <p className="text-gray-800">{selectedPrescription.prescriptionDetails.title}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Type:</label>
                    <p className="text-gray-800 capitalize">{selectedPrescription.prescriptionDetails.type.replace('-', ' ')}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status:</label>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      getStatusColor(selectedPrescription.prescriptionDetails.status)
                    }`}>
                      {selectedPrescription.prescriptionDetails.status.charAt(0).toUpperCase() + selectedPrescription.prescriptionDetails.status.slice(1)}
                    </span>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Prescribed Date:</label>
                    <p className="text-gray-800">{formatDate(selectedPrescription.prescriptionDetails.prescribedDate)}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Expiry Date:</label>
                    <p className="text-gray-800">{formatDate(selectedPrescription.prescriptionDetails.expiryDate)}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Instructions:</label>
                    <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{selectedPrescription.prescriptionDetails.instructions}</p>
                  </div>
                </div>
              </div>

              {/* Doctor Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Doctor Information</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Doctor Name:</label>
                    <p className="text-gray-800">{selectedPrescription.doctorDetails?.profile.name || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Specialty:</label>
                    <p className="text-gray-800">{selectedPrescription.doctorDetails?.profile.specialty || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Department:</label>
                    <p className="text-gray-800">{selectedPrescription.doctorDetails?.profile.department || 'N/A'}</p>
                  </div>
                </div>

                {/* Medications */}
                {Object.keys(selectedPrescription.medications || {}).length > 0 && (
                  <div>
                    <h4 className="text-md font-semibold text-gray-800 mb-3">Medications</h4>
                    <div className="space-y-2">
                      {Object.entries(selectedPrescription.medications || {}).map(([id, medication]) => (
                        <div key={id} className="bg-blue-50 p-3 rounded-lg">
                          <p className="font-medium text-blue-800">{medication.name} - {medication.dosage}</p>
                          <p className="text-sm text-blue-600">{medication.frequency} for {medication.duration}</p>
                          <p className="text-sm text-gray-600">{medication.instructions}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Documents */}
                {Object.keys(selectedPrescription.documents || {}).length > 0 && (
                  <div>
                    <h4 className="text-md font-semibold text-gray-800 mb-3">Documents</h4>
                    <div className="space-y-2">
                      {Object.entries(selectedPrescription.documents || {}).map(([id, document]) => (
                        <div key={id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-800">{document.fileName}</p>
                            <p className="text-sm text-gray-600">{document.fileSize} • {document.fileType.toUpperCase()}</p>
                          </div>
                          <button
                            onClick={() => {
                              if (document.fileContent) {
                                downloadFileFromBase64(
                                  document.fileContent,
                                  document.fileName,
                                  document.fileType
                                );
                              } else if (document.fileUrl) {
                                // Fallback for old documents
                                window.open(document.fileUrl, '_blank');
                              }
                            }}
                            className="text-blue-600 hover:text-blue-800"
                            title="Download File"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {selectedPrescription.notes && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">Additional Notes</h3>
                <p className="text-gray-800 bg-gray-50 p-4 rounded-lg">{selectedPrescription.notes}</p>
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleEditPrescription(selectedPrescription);
                }}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Edit Prescription
              </button>
              <button
                onClick={handleCloseModals}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Prescription Modal */}
      {isEditModalOpen && selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Edit Prescription</h2>
              <button 
                onClick={handleCloseModals}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title:</label>
                <input
                  type="text"
                  name="title"
                  value={editFormData.title}
                  onChange={handleEditInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type:</label>
                <select 
                  name="type"
                  value={editFormData.type}
                  onChange={handleEditInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="medication">Medication</option>
                  <option value="lab-report">Lab Report</option>
                  <option value="x-ray">X-Ray</option>
                  <option value="blood-test">Blood Test</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status:</label>
                <select 
                  name="status"
                  value={editFormData.status}
                  onChange={handleEditInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="expired">Expired</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Instructions:</label>
                <textarea
                  name="instructions"
                  value={editFormData.instructions}
                  onChange={handleEditInputChange}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes:</label>
                <textarea
                  name="notes"
                  value={editFormData.notes}
                  onChange={handleEditInputChange}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={handleSaveChanges}
                className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                Save Changes
              </button>
              <button
                onClick={handleCloseModals}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}