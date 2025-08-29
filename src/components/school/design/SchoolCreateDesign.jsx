import {useEffect, useState} from 'react';
import {
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    FormControlLabel,
    FormLabel,
    MenuItem,
    Radio,
    RadioGroup,
    Select,
    TextField,
    Typography
} from '@mui/material';
import { InlineLoading } from '../../ui/LoadingSpinner.jsx';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import {ColorPicker} from 'antd';
import {enqueueSnackbar} from "notistack";
import {createDesignRequest, getFabrics} from "../../../services/DesignService.jsx";
import {uploadCloudinary} from "../../../services/UploadImageService.jsx";
import DisplayImage from "../../ui/DisplayImage.jsx";


export default function SchoolCreateDesign() {
    const [designRequest, setDesignRequest] = useState({
        designName: '',
        logo: {
            file: null,
            preview: null,
        },
        uniformTypes: {
            regular: {
                selected: false,
                genders: {boy: false, girl: false},
                details: {
                    boy: {
                        shirt: {
                            fabric: '',
                            color: '#FFFFFF',
                            logoPlacement: '',
                            note: '',
                            createType: 'new',
                            images: [],
                        },
                        pants: {
                            fabric: '',
                            color: '#000080',
                            note: '',
                            createType: 'new',
                            images: [],
                        },
                        showForm: false,
                    },
                    girl: {
                        shirt: {
                            fabric: '',
                            color: '#FFFFFF',
                            logoPlacement: '',
                            note: '',
                            createType: 'new',
                            images: [],
                        },
                        pants: {
                            fabric: '',
                            color: '#000080',
                            note: '',
                            createType: 'new',
                            images: [],
                        },
                        skirt: {
                            fabric: '',
                            color: '#000080',
                            note: '',
                            createType: 'new',
                            images: [],
                        },
                        bottomType: 'pants',
                        showForm: false,
                    },
                },
            },
            physicalEducation: {
                selected: false,
                genders: {boy: false, girl: false},
                details: {
                    boy: {
                        shirt: {
                            fabric: '',
                            color: '#FFFFFF',
                            logoPlacement: '',
                            note: '',
                            createType: 'new',
                            images: [],
                        },
                        pants: {
                            fabric: '',
                            color: '#000080',
                            note: '',
                            createType: 'new',
                            images: [],
                        },
                        showForm: false,
                    },
                    girl: {
                        shirt: {
                            fabric: '',
                            color: '#FFFFFF',
                            logoPlacement: '',
                            note: '',
                            createType: 'new',
                            images: [],
                        },
                        pants: {
                            fabric: '',
                            color: '#000080',
                            note: '',
                            createType: 'new',
                            images: [],
                        },
                        showForm: false,
                    },
                },
            },
        },
    });

    const [isLogoImagePopupOpen, setIsLogoImagePopupOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const MAX_IMAGES = 4;
    const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
    const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

    const [uniformFabrics, setUniformFabrics] = useState([]);

    const isBoyInfoComplete = (uniformType) => {
        const boyDetails = designRequest.uniformTypes[uniformType].details.boy;
        const shirt = boyDetails.shirt;
        const pants = boyDetails.pants;

        return shirt.fabric && shirt.logoPlacement && pants.fabric;
    };

    const isGirlInfoComplete = (uniformType) => {
        const girlDetails = designRequest.uniformTypes[uniformType].details.girl;
        const shirt = girlDetails.shirt;

        if (uniformType === 'regular') {
            const bottomType = designRequest.uniformTypes.regular.details.girl.bottomType;
            const bottomFabric = bottomType === 'skirt' ? girlDetails.skirt.fabric : girlDetails.pants.fabric;
            return shirt.fabric && shirt.logoPlacement && bottomFabric && bottomType;
        } else {
            return shirt.fabric && shirt.logoPlacement && girlDetails.pants.fabric;
        }
    };

    const getMissingFields = (uniformType, gender) => {
        const missing = [];

        if (gender === 'boy') {
            const boyDetails = designRequest.uniformTypes[uniformType].details.boy;
            if (!boyDetails.shirt.fabric) missing.push('Shirt Fabric');
            if (!boyDetails.shirt.logoPlacement) missing.push('Shirt Logo Placement');
            if (!boyDetails.pants.fabric) missing.push('Pants Fabric');
        } else {
            const girlDetails = designRequest.uniformTypes[uniformType].details.girl;
            if (!girlDetails.shirt.fabric) missing.push('Shirt Fabric');
            if (!girlDetails.shirt.logoPlacement) missing.push('Shirt Logo Placement');

            if (uniformType === 'regular') {
                if (!designRequest.uniformTypes.regular.details.girl.bottomType) {
                    missing.push('Bottom Type');
                } else {
                    const bottomType = designRequest.uniformTypes.regular.details.girl.bottomType;
                    const bottomFabric = bottomType === 'skirt' ? girlDetails.skirt.fabric : girlDetails.pants.fabric;
                    if (!bottomFabric) missing.push(`${bottomType === 'skirt' ? 'Skirt' : 'Pants'} Fabric`);
                }
            } else {
                if (!girlDetails.pants.fabric) missing.push('Pants Fabric');
            }
        }

        return missing;
    };

    const isFieldMissing = (uniformType, gender, fieldType, itemType = null) => {
        if (gender === 'boy') {
            const boyDetails = designRequest.uniformTypes[uniformType].details.boy;
            if (fieldType === 'shirtFabric') return !boyDetails.shirt.fabric;
            if (fieldType === 'shirtLogoPlacement') return !boyDetails.shirt.logoPlacement;
            if (fieldType === 'pantsFabric') return !boyDetails.pants.fabric;
        } else {
            const girlDetails = designRequest.uniformTypes[uniformType].details.girl;
            if (fieldType === 'shirtFabric') return !girlDetails.shirt.fabric;
            if (fieldType === 'shirtLogoPlacement') return !girlDetails.shirt.logoPlacement;

            if (uniformType === 'regular') {
                if (fieldType === 'bottomType') return !designRequest.uniformTypes.regular.details.girl.bottomType;
                if (fieldType === 'bottomFabric') {
                    const bottomType = designRequest.uniformTypes.regular.details.girl.bottomType;
                    if (!bottomType) return true;
                    const bottomFabric = bottomType === 'skirt' ? girlDetails.skirt.fabric : girlDetails.pants.fabric;
                    return !bottomFabric;
                }
            } else if (uniformType === 'physicalEducation') {
                if (fieldType === 'pantsFabric') return !girlDetails.pants.fabric;
            }
        }
        return false;
    };

    useEffect(() => {
        async function FetchFabrics() {
            return await getFabrics()
        }

        FetchFabrics().then(res => {
            let fabrics = []
            const regular = res.data.body.regular
            const physical = res.data.body.physical

            const rShirt = regular.shirts
            const rPants = regular.pants
            const rSkirt = regular.skirts

            const pShirt = physical.shirts
            const pPants = physical.pants

            for (const cloth of rShirt) {
                fabrics.push({id: cloth.id, name: cloth.name, type: 'shirt', category: 'regular'})
            }

            for (const cloth of rPants) {
                fabrics.push({id: cloth.id, name: cloth.name, type: 'pants', category: 'regular'})
            }

            for (const cloth of rSkirt) {
                fabrics.push({id: cloth.id, name: cloth.name, type: 'skirt', category: 'regular'})
            }

            for (const cloth of pShirt) {
                fabrics.push({id: cloth.id, name: cloth.name, type: 'shirt', category: 'pe'})
            }

            for (const cloth of pPants) {
                fabrics.push({id: cloth.id, name: cloth.name, type: 'pants', category: 'pe'})
            }
            setUniformFabrics(fabrics)
        });
    }, [])

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const ext = file.name.split('.').pop().toLowerCase();
            if (!ALLOWED_EXTENSIONS.includes(ext)) {
                enqueueSnackbar('Only JPG, JPEG, PNG, GIF, WEBP files are allowed for logo.', {variant: 'error'});
                return;
            }

            const MAX_LOGO_SIZE = 5 * 1024 * 1024;
            if (file.size > MAX_LOGO_SIZE) {
                enqueueSnackbar('Logo file must be less than 5MB.', {variant: 'error'});
                return;
            }

            setDesignRequest((prev) => ({
                ...prev,
                logo: {file: file, preview: URL.createObjectURL(file)}
            }));
        }
    };

    const handleUniformChange = (type) => {
        setDesignRequest(prev => ({
            ...prev,
            uniformTypes: {
                ...prev.uniformTypes,
                [type]: {
                    ...prev.uniformTypes[type],
                    selected: !prev.uniformTypes[type].selected
                }
            }
        }));
    };

    const handleGenderChange = (uniformType, gender) => {
        setDesignRequest(prev => ({
            ...prev,
            uniformTypes: {
                ...prev.uniformTypes,
                [uniformType]: {
                    ...prev.uniformTypes[uniformType],
                    genders: {
                        ...prev.uniformTypes[uniformType].genders,
                        [gender]: !prev.uniformTypes[uniformType].genders[gender]
                    }
                }
            }
        }));
    };

    const handleImageUpload = (e, uniformType, gender, itemType) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file => {
            const ext = file.name.split('.').pop().toLowerCase();
            if (!ALLOWED_EXTENSIONS.includes(ext)) {
                enqueueSnackbar('Only JPG, JPEG, PNG, GIF, WEBP files are allowed.', {variant: 'error'});
                return false;
            }
            if (file.size > MAX_IMAGE_SIZE) {
                enqueueSnackbar('Each image must be less than 10MB.', {variant: 'error'});
                return false;
            }
            return true;
        });
        if (validFiles.length === 0) return;

        setDesignRequest(prev => {
            const currentImages = prev.uniformTypes[uniformType].details[gender][itemType].images;
            if (currentImages.length + validFiles.length > MAX_IMAGES) {
                enqueueSnackbar(`You can upload up to ${MAX_IMAGES} images.`, {variant: 'error'});
                return prev;
            }
            return {
                ...prev,
                uniformTypes: {
                    ...prev.uniformTypes,
                    [uniformType]: {
                        ...prev.uniformTypes[uniformType],
                        details: {
                            ...prev.uniformTypes[uniformType].details,
                            [gender]: {
                                ...prev.uniformTypes[uniformType].details[gender],
                                [itemType]: {
                                    ...prev.uniformTypes[uniformType].details[gender][itemType],
                                    images: [...currentImages, ...validFiles.slice(0, MAX_IMAGES - currentImages.length)]
                                }
                            }
                        }
                    }
                }
            };
        });
    };

    const handleRemoveImage = (index, uniformType, gender, itemType) => {
        setDesignRequest(prev => {
            const newImages = [...prev.uniformTypes[uniformType].details[gender][itemType].images];
            newImages.splice(index, 1);
            return {
                ...prev,
                uniformTypes: {
                    ...prev.uniformTypes,
                    [uniformType]: {
                        ...prev.uniformTypes[uniformType],
                        details: {
                            ...prev.uniformTypes[uniformType].details,
                            [gender]: {
                                ...prev.uniformTypes[uniformType].details[gender],
                                [itemType]: {
                                    ...prev.uniformTypes[uniformType].details[gender][itemType],
                                    images: newImages
                                }
                            }
                        }
                    }
                }
            };
        });
    };

    const handleMapImages = async (images) => {
        if (images.length === 0) return []
        const resultImage = []
        for (const img of images) {
            const response = await uploadCloudinary(img)
            if (response) {
                resultImage.push({url: response})
            }
        }

        return resultImage
    }

    const handleSubmit = async () => {
        setIsSubmitting(true);

        if (!designRequest.designName.trim()) {
            enqueueSnackbar('Design Name is required.', {variant: 'error'});
            setIsSubmitting(false);
            return;
        }

        if (!designRequest.uniformTypes.regular.selected && !designRequest.uniformTypes.physicalEducation.selected) {
            enqueueSnackbar('Please select at least one Uniform Type.', {variant: 'error'});
            setIsSubmitting(false);
            return;
        }

        if (designRequest.uniformTypes.regular.selected && (!designRequest.uniformTypes.regular.genders.boy && !designRequest.uniformTypes.regular.genders.girl)) {
            enqueueSnackbar('Please select at least one gender for Regular Uniform.', {variant: 'error'});
            setIsSubmitting(false);
            return;
        }

        if (designRequest.uniformTypes.physicalEducation.selected && (!designRequest.uniformTypes.physicalEducation.genders.boy && !designRequest.uniformTypes.physicalEducation.genders.girl)) {
            enqueueSnackbar('Please select at least one gender for Physical Education Uniform.', {variant: 'error'});
            setIsSubmitting(false);
            return;
        }

        if (designRequest.uniformTypes.regular.selected) {
            if (designRequest.uniformTypes.regular.genders.boy) {
                if (!designRequest.uniformTypes.regular.details.boy.shirt.fabric) {
                    enqueueSnackbar('Boy Shirt Fabric for Regular Uniform is required.', {variant: 'error'});
                    setIsSubmitting(false);
                    return;
                }
                if (!designRequest.uniformTypes.regular.details.boy.pants.fabric) {
                    enqueueSnackbar('Boy Pants Fabric for Regular Uniform is required.', {variant: 'error'});
                    setIsSubmitting(false);
                    return;
                }
                if (!designRequest.uniformTypes.regular.details.boy.shirt.logoPlacement) {
                    enqueueSnackbar('Boy Shirt Logo Placement for Regular Uniform is required.', {variant: 'error'});
                    setIsSubmitting(false);
                    return;
                }
            }
            if (designRequest.uniformTypes.regular.genders.girl) {
                if (!designRequest.uniformTypes.regular.details.girl.shirt.fabric) {
                    enqueueSnackbar('Girl Shirt Fabric for Regular Uniform is required.', {variant: 'error'});
                    setIsSubmitting(false);
                    return;
                }
                const bottomType = designRequest.uniformTypes.regular.details.girl.bottomType;
                const bottomFabric = bottomType === "skirt"
                    ? designRequest.uniformTypes.regular.details.girl.skirt.fabric
                    : designRequest.uniformTypes.regular.details.girl.pants.fabric;
                if (!bottomFabric) {
                    enqueueSnackbar('Girl Pants/Skirt Fabric for Regular Uniform is required.', {variant: 'error'});
                    setIsSubmitting(false);
                    return;
                }
                if (!designRequest.uniformTypes.regular.details.girl.bottomType) {
                    enqueueSnackbar('Bottom Type for Regular Uniform Girl is required.', {variant: 'error'});
                    setIsSubmitting(false);
                    return;
                }
                if (!designRequest.uniformTypes.regular.details.girl.shirt.logoPlacement) {
                    enqueueSnackbar('Girl Shirt Logo Placement for Regular Uniform is required.', {variant: 'error'});
                    setIsSubmitting(false);
                    return;
                }
            }
        }

        if (designRequest.uniformTypes.physicalEducation.selected) {
            if (designRequest.uniformTypes.physicalEducation.genders.boy) {
                if (!designRequest.uniformTypes.physicalEducation.details.boy.shirt.fabric) {
                    enqueueSnackbar('Boy Shirt Fabric for Physical Education Uniform is required.', {variant: 'error'});
                    setIsSubmitting(false);
                    return;
                }
                if (!designRequest.uniformTypes.physicalEducation.details.boy.pants.fabric) {
                    enqueueSnackbar('Boy Pants Fabric for Physical Education Uniform is required.', {variant: 'error'});
                    setIsSubmitting(false);
                    return;
                }
                if (!designRequest.uniformTypes.physicalEducation.details.boy.shirt.logoPlacement) {
                    enqueueSnackbar('Boy Shirt Logo Placement for Physical Education Uniform is required.', {variant: 'error'});
                    setIsSubmitting(false);
                    return;
                }
            }
            if (designRequest.uniformTypes.physicalEducation.genders.girl) {
                if (!designRequest.uniformTypes.physicalEducation.details.girl.shirt.fabric) {
                    enqueueSnackbar('Girl Shirt Fabric for Physical Education Uniform is required.', {variant: 'error'});
                    setIsSubmitting(false);
                    return;
                }
                if (!designRequest.uniformTypes.physicalEducation.details.girl.pants.fabric) {
                    enqueueSnackbar('Girl Pants/Skirt Fabric for Physical Education Uniform is required.', {variant: 'error'});
                    setIsSubmitting(false);
                    return;
                }
                if (!designRequest.uniformTypes.physicalEducation.details.girl.shirt.logoPlacement) {
                    enqueueSnackbar('Girl Shirt Logo Placement for Physical Education Uniform is required.', {variant: 'error'});
                    setIsSubmitting(false);
                    return;
                }
            }
        }

        const designName = designRequest.designName

        if (!designRequest.logo.file) {
            enqueueSnackbar('School Logo is required.', {variant: 'error'});
            setIsSubmitting(false);
            return;
        }

        const logoFile = designRequest.logo.file
        const logo = await uploadCloudinary(logoFile)

        if (!logo) {
            enqueueSnackbar('Failed to upload logo image. Please try again.', {variant: 'error'});
            setIsSubmitting(false);
            return;
        }

        const designItems = []
        const pe = designRequest.uniformTypes.physicalEducation
        const regular = designRequest.uniformTypes.regular

        if (regular.selected) {
            if (regular.genders.boy) {
                const boyDetail = regular.details.boy
                const shirt = boyDetail.shirt
                const pants = boyDetail.pants

                const shirtImg = await handleMapImages(shirt.images)
                const pantsImg = await handleMapImages(pants.images)

                designItems.push({
                    designType: shirt.createType,
                    gender: 'boy',
                    itemType: 'shirt',
                    itemCategory: 'regular',
                    fabricId: parseInt(shirt.fabric),
                    logoPosition: shirt.logoPlacement?.toLowerCase(),
                    color: shirt.color,
                    note: shirt.note,
                    uploadImage: shirtImg
                })

                designItems.push({
                    designType: pants.createType,
                    gender: 'boy',
                    itemType: 'pants',
                    itemCategory: 'regular',
                    fabricId: parseInt(pants.fabric),
                    logoPosition: "",
                    color: pants.color,
                    note: pants.note,
                    uploadImage: pantsImg
                })
            }

            if (regular.genders.girl) {
                const girlDetail = regular.details.girl
                const shirt = girlDetail.shirt
                let pants = null
                let skirt = null

                if (girlDetail.pants.fabric !== "") {
                    pants = girlDetail.pants
                } else {
                    skirt = girlDetail.skirt
                }

                const shirtImg = await handleMapImages(shirt.images)

                designItems.push({
                    designType: shirt.createType,
                    gender: 'girl',
                    itemType: 'shirt',
                    itemCategory: 'regular',
                    fabricId: parseInt(shirt.fabric),
                    logoPosition: shirt.logoPlacement,
                    color: shirt.color,
                    note: shirt.note,
                    uploadImage: shirtImg
                })

                if (pants) {

                    const pantsImg = await handleMapImages(pants.images)

                    designItems.push({
                        designType: pants.createType,
                        gender: 'girl',
                        itemType: 'pants',
                        itemCategory: 'regular',
                        fabricId: parseInt(pants.fabric),
                        logoPosition: "",
                        color: pants.color,
                        note: pants.note,
                        uploadImage: pantsImg
                    })
                }

                if (skirt) {

                    const skirtImg = await handleMapImages(skirt.images)

                    designItems.push({
                        designType: skirt.createType,
                        gender: 'girl',
                        itemType: 'skirt',
                        itemCategory: 'regular',
                        fabricId: parseInt(skirt.fabric),
                        logoPosition: "",
                        color: skirt.color,
                        note: skirt.note,
                        uploadImage: skirtImg
                    })
                }
            }
        }

        if (pe.selected) {
            if (pe.genders.boy) {
                const boyDetail = pe.details.boy
                const shirt = boyDetail.shirt
                const pants = boyDetail.pants

                const shirtImg = await handleMapImages(shirt.images)
                const pantsImg = await handleMapImages(pants.images)

                designItems.push({
                    designType: shirt.createType,
                    gender: 'boy',
                    itemType: 'shirt',
                    itemCategory: 'physical',
                    fabricId: parseInt(shirt.fabric),
                    logoPosition: shirt.logoPlacement,
                    color: shirt.color,
                    note: shirt.note,
                    uploadImage: shirtImg
                })

                designItems.push({
                    designType: pants.createType,
                    gender: 'boy',
                    itemType: 'pants',
                    itemCategory: 'physical',
                    fabricId: parseInt(pants.fabric),
                    logoPosition: "",
                    color: pants.color,
                    note: pants.note,
                    uploadImage: pantsImg
                })
            }

            if (pe.genders.girl) {
                const girlDetail = pe.details.girl
                const shirt = girlDetail.shirt
                let pants = girlDetail.pants

                const shirtImg = await handleMapImages(shirt.images)
                const pantsImg = await handleMapImages(pants.images)

                designItems.push({
                    designType: shirt.createType,
                    gender: 'girl',
                    itemType: 'shirt',
                    itemCategory: 'physical',
                    fabricId: parseInt(shirt.fabric),
                    logoPosition: shirt.logoPlacement,
                    color: shirt.color,
                    note: shirt.note,
                    uploadImage: shirtImg
                })

                designItems.push({
                    designType: pants.createType,
                    gender: 'girl',
                    itemType: 'pants',
                    itemCategory: 'physical',
                    fabricId: parseInt(pants.fabric),
                    logoPosition: "",
                    color: pants.color,
                    note: pants.note,
                    uploadImage: pantsImg
                })
            }
        }

        const request = {
            designName: designName,
            logoImage: logo,
            designItem: designItems
        }

        try {
            const createResponse = await createDesignRequest(request)
            if (createResponse && createResponse.status === 201) {
                enqueueSnackbar(createResponse.data.message, {variant: 'success', autoHideDuration: 1000})
                setTimeout(() => {
                    window.location.href = '/school/design';
                }, 1000)
            } else {
                enqueueSnackbar("Fail to create design request", {variant: 'error'})
            }
        } catch (error) {
            console.error('Error creating design request:', error);
            enqueueSnackbar("An error occurred while creating the design request", {variant: 'error'})
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderBoyUniformDetails = (uniformType) => {
        const shirtCreateType = designRequest.uniformTypes[uniformType].details.boy.shirt.createType;
        const setShirtCreateType = (value) => {
            setDesignRequest(prev => ({
                ...prev,
                uniformTypes: {
                    ...prev.uniformTypes,
                    [uniformType]: {
                        ...prev.uniformTypes[uniformType],
                        details: {
                            ...prev.uniformTypes[uniformType].details,
                            boy: {
                                ...prev.uniformTypes[uniformType].details.boy,
                                shirt: {
                                    ...prev.uniformTypes[uniformType].details.boy.shirt,
                                    createType: value
                                }
                            }
                        }
                    }
                }
            }));
        };
        const pantsCreateType = designRequest.uniformTypes[uniformType].details.boy.pants.createType;
        const setPantsCreateType = (value) => {
            setDesignRequest(prev => ({
                ...prev,
                uniformTypes: {
                    ...prev.uniformTypes,
                    [uniformType]: {
                        ...prev.uniformTypes[uniformType],
                        details: {
                            ...prev.uniformTypes[uniformType].details,
                            boy: {
                                ...prev.uniformTypes[uniformType].details.boy,
                                pants: {
                                    ...prev.uniformTypes[uniformType].details.boy.pants,
                                    createType: value
                                }
                            }
                        }
                    }
                }
            }));
        };
        const shirtImages = designRequest.uniformTypes[uniformType].details.boy.shirt.images;
        const pantsImages = designRequest.uniformTypes[uniformType].details.boy.pants.images;
        return (
            <>


                <Box sx={{
                    mb: 3,
                    p: 3,
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    backgroundColor: '#fafafa'
                }}>
                    <Typography variant="h6" sx={{
                        color: '#333',
                        mb: 2,
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}>
                        👕 Shirt Configuration
                    </Typography>

                    <Box sx={{display: 'grid', gap: 3}}>

                        <Box>
                            <Typography variant="subtitle2" sx={{mb: 1, fontWeight: '600'}}>
                                Design Type *
                            </Typography>
                            <FormControl fullWidth size="small">
                                <Select
                                    value={shirtCreateType}
                                    onChange={e => setShirtCreateType(e.target.value)}
                                    displayEmpty
                                    renderValue={(selected) => {
                                        if (selected === '') {
                                            return 'Select design approach';
                                        }

                                        const options = {
                                            'new': 'New Design - Create from scratch',
                                            'upload': 'Upload Image - Provide reference images',
                                        };

                                        return options[selected];
                                    }}
                                    variant='outlined'>
                                    <MenuItem value="new">New Design - Create from scratch</MenuItem>
                                    <MenuItem value="upload">Upload Image - Provide reference images</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>


                        {shirtCreateType === 'upload' && (
                            <Box>
                                <Typography variant="subtitle2" sx={{mb: 1, fontWeight: '600'}}>
                                    Reference Images (Max 4)
                                </Typography>
                                <Box sx={{
                                    border: '2px dashed #ddd',
                                    borderRadius: '8px',
                                    p: 3,
                                    textAlign: 'center',
                                    backgroundColor: '#fafafa'
                                }}>
                                    <Button
                                        variant="outlined"
                                        component="label"
                                        sx={{mb: 2}}
                                        startIcon={<CloudUploadIcon/>}
                                    >
                                        Upload Shirt Images
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/gif"
                                            multiple
                                            hidden
                                            onChange={e => handleImageUpload(e, uniformType, 'boy', 'shirt')}
                                        />
                                    </Button>
                                    <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
                                        JPG, PNG, GIF, WEBP up to 10MB each
                                    </Typography>

                                    {shirtImages.length > 0 && (
                                        <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center'}}>
                                            {shirtImages.map((file, idx) => (
                                                <Box key={idx} sx={{
                                                    position: 'relative',
                                                    width: 80,
                                                    height: 80,
                                                    borderRadius: '8px',
                                                    overflow: 'hidden'
                                                }}>
                                                    <DisplayImage
                                                        imageUrl={URL.createObjectURL(file)}
                                                        alt={`preview-${idx}`}
                                                        width="80px"
                                                        height="80px"
                                                    />
                                                    <Button
                                                        size="small"
                                                        color="error"
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 2,
                                                            right: 2,
                                                            minWidth: 0,
                                                            width: 20,
                                                            height: 20,
                                                            borderRadius: '50%',
                                                            backgroundColor: 'rgba(255,255,255,0.9)',
                                                            fontSize: 12,
                                                            zIndex: 2
                                                        }}
                                                        onClick={() => handleRemoveImage(idx, uniformType, 'boy', 'shirt')}
                                                    >
                                                        ×
                                                    </Button>
                                                </Box>
                                            ))}
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        )}


                        <Box>
                            <Typography variant="subtitle2" sx={{
                                mb: 1,
                                fontWeight: '600',
                                color: isFieldMissing(uniformType, 'boy', 'shirtFabric') ? '#d32f2f' : '#1e293b'
                            }}>
                                Fabric Type *
                            </Typography>
                            <FormControl fullWidth size="small">
                                <Select
                                    value={designRequest.uniformTypes[uniformType].details.boy.shirt.fabric}
                                    onChange={(e) => {
                                        setDesignRequest(prev => ({
                                            ...prev,
                                            uniformTypes: {
                                                ...prev.uniformTypes,
                                                [uniformType]: {
                                                    ...prev.uniformTypes[uniformType],
                                                    details: {
                                                        ...prev.uniformTypes[uniformType].details,
                                                        boy: {
                                                            ...prev.uniformTypes[uniformType].details.boy,
                                                            shirt: {
                                                                ...prev.uniformTypes[uniformType].details.boy.shirt,
                                                                fabric: e.target.value
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }));
                                    }}
                                    displayEmpty
                                    renderValue={(selected) => {
                                        if (!selected) return <em>Select fabric type</em>;
                                        const fabric = uniformFabrics.find(f => f.id === selected);
                                        return fabric ? fabric.name : '';
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: isFieldMissing(uniformType, 'boy', 'shirtFabric') ? '#d32f2f' : '#c0c0c0',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: isFieldMissing(uniformType, 'boy', 'shirtFabric') ? '#d32f2f' : '#2e7d32',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: isFieldMissing(uniformType, 'boy', 'shirtFabric') ? '#d32f2f' : '#2e7d32',
                                            },
                                        },
                                    }}
                                    variant='outlined'>
                                    {uniformFabrics
                                        .filter(fabric => fabric.type === 'shirt' && fabric.category === 'regular')
                                        .map((fabric, index) => (
                                            <MenuItem key={index} value={fabric.id}>
                                                {fabric.name}
                                            </MenuItem>
                                        ))}
                                </Select>
                            </FormControl>
                        </Box>


                        <Box>
                            <Typography variant="subtitle2" sx={{mb: 1, fontWeight: '600'}}>
                                Color *
                            </Typography>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                p: 2,
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                backgroundColor: 'white'
                            }}>
                                <ColorPicker
                                    value={designRequest.uniformTypes[uniformType].details.boy.shirt.color}
                                    onChange={(color) => {
                                        setDesignRequest(prev => ({
                                            ...prev,
                                            uniformTypes: {
                                                ...prev.uniformTypes,
                                                [uniformType]: {
                                                    ...prev.uniformTypes[uniformType],
                                                    details: {
                                                        ...prev.uniformTypes[uniformType].details,
                                                        boy: {
                                                            ...prev.uniformTypes[uniformType].details.boy,
                                                            shirt: {
                                                                ...prev.uniformTypes[uniformType].details.boy.shirt,
                                                                color: color.toHexString()
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }));
                                    }}
                                    getPopupContainer={(triggerNode) => triggerNode?.parentElement || document.body}
                                    styles={{
                                        popupOverlayInner: {
                                            zIndex: 9999
                                        }
                                    }}
                                />
                                <Typography variant="body2" color="text.secondary">
                                    Selected: {designRequest.uniformTypes[uniformType].details.boy.shirt.color}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                <Box sx={{
                    mb: 3,
                    p: 3,
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    backgroundColor: '#fafafa'
                }}>
                    <Typography variant="h6" sx={{
                        color: '#333',
                        mb: 2,
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}>
                        Logo Placement
                    </Typography>

                    <Box sx={{display: 'grid', gap: 2}}>
                        <Box sx={{display: 'flex', gap: 2, alignItems: 'center'}}>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => setIsLogoImagePopupOpen(true)}
                                sx={{whiteSpace: 'nowrap'}}
                            >
                                📋 View Guide
                            </Button>
                            <Typography variant="body2" color="text.secondary">
                                Click to see logo placement options
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="subtitle2" sx={{
                                mb: 1,
                                fontWeight: '600',
                                color: isFieldMissing(uniformType, 'boy', 'shirtLogoPlacement') ? '#d32f2f' : '#1e293b'
                            }}>
                                Placement Position *
                            </Typography>
                            <FormControl fullWidth size="small">
                                <Select
                                    value={designRequest.uniformTypes[uniformType].details.boy.shirt.logoPlacement}
                                    onChange={(e) => {
                                        setDesignRequest(prev => ({
                                            ...prev,
                                            uniformTypes: {
                                                ...prev.uniformTypes,
                                                [uniformType]: {
                                                    ...prev.uniformTypes[uniformType],
                                                    details: {
                                                        ...prev.uniformTypes[uniformType].details,
                                                        boy: {
                                                            ...prev.uniformTypes[uniformType].details.boy,
                                                            shirt: {
                                                                ...prev.uniformTypes[uniformType].details.boy.shirt,
                                                                logoPlacement: e.target.value
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }));
                                    }}
                                    displayEmpty
                                    renderValue={(selected) => selected || 'Select logo placement'}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: isFieldMissing(uniformType, 'boy', 'shirtLogoPlacement') ? '#d32f2f' : '#c0c0c0',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: isFieldMissing(uniformType, 'boy', 'shirtLogoPlacement') ? '#d32f2f' : '#2e7d32',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: isFieldMissing(uniformType, 'boy', 'shirtLogoPlacement') ? '#d32f2f' : '#2e7d32',
                                            },
                                        },
                                    }}
                                    variant='outlined'>
                                    <MenuItem value="">
                                        <em>No logo placement</em>
                                    </MenuItem>
                                    <MenuItem value="Left Sleeve">Left Sleeve</MenuItem>
                                    <MenuItem value="Right Sleeve">Right Sleeve</MenuItem>
                                    <MenuItem value="Left Chest">Left Chest</MenuItem>
                                    <MenuItem value="Right Chest">Right Chest</MenuItem>
                                    <MenuItem value="Front Hip">Front Hip</MenuItem>
                                    <MenuItem value="Back Neck">Back Neck</MenuItem>
                                    <MenuItem value="Back Through Shoulders">Back Through Shoulders</MenuItem>
                                    <MenuItem value="Center Back">Center Back</MenuItem>
                                    <MenuItem value="Bottom Back">Bottom Back</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </Box>
                </Box>

                <Dialog
                    open={isLogoImagePopupOpen}
                    onClose={() => setIsLogoImagePopupOpen(false)}
                    maxWidth="md"
                    fullWidth
                    sx={{
                        '& .MuiDialog-paper': {
                            borderRadius: '12px'
                        }
                    }}
                >
                    <DialogTitle sx={{
                        textAlign: 'center',
                        fontWeight: '600',
                        color: '#333'
                    }}>
                        Logo Placement Guide
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            p: 2
                        }}>
                            <img
                                src="/logoPos.png"
                                alt="Logo Placement Guide"
                                style={{
                                    maxWidth: '100%',
                                    height: 'auto',
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{p: 2, justifyContent: 'center'}}>
                        <Button
                            onClick={() => setIsLogoImagePopupOpen(false)}
                            variant="contained"
                            sx={{px: 4}}
                        >
                            Got it
                        </Button>
                    </DialogActions>
                </Dialog>

                <Box sx={{
                    mb: 3,
                    p: 3,
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    backgroundColor: '#fafafa'
                }}>
                    <Typography variant="h6" sx={{
                        color: '#333',
                        mb: 2,
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}>
                        💭 Additional Notes (Shirt)
                    </Typography>
                    <TextField
                        placeholder="Any special requirements or instructions for the shirt design..."
                        value={designRequest.uniformTypes[uniformType].details.boy.shirt.note}
                        onChange={(e) => {
                            setDesignRequest(prev => ({
                                ...prev,
                                uniformTypes: {
                                    ...prev.uniformTypes,
                                    [uniformType]: {
                                        ...prev.uniformTypes[uniformType],
                                        details: {
                                            ...prev.uniformTypes[uniformType].details,
                                            boy: {
                                                ...prev.uniformTypes[uniformType].details.boy,
                                                shirt: {
                                                    ...prev.uniformTypes[uniformType].details.boy.shirt,
                                                    note: e.target.value
                                                }
                                            }
                                        }
                                    }
                                }
                            }));
                        }}
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={3}
                        size="small"
                    />
                </Box>

                <Divider sx={{my: 4, borderColor: '#ddd'}}/>


                <Box sx={{
                    mb: 3,
                    p: 3,
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    backgroundColor: '#fafafa'
                }}>
                    <Typography variant="h6" sx={{
                        color: '#333',
                        mb: 2,
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}>
                        👖 Pants Configuration
                    </Typography>

                    <Box sx={{display: 'grid', gap: 3}}>
                        <Box>
                            <Typography variant="subtitle2" sx={{mb: 1, fontWeight: '600'}}>
                                Design Type *
                            </Typography>
                            <FormControl fullWidth size="small">
                                <Select
                                    value={pantsCreateType}
                                    onChange={e => setPantsCreateType(e.target.value)}
                                    displayEmpty
                                    renderValue={(selected) => {
                                        if (selected === '') {
                                            return 'Select design approach';
                                        }

                                        const options = {
                                            'new': 'New Design - Create from scratch',
                                            'upload': 'Upload Image - Provide reference images',
                                        };

                                        return options[selected];
                                    }}
                                    variant='outlined'>
                                    <MenuItem value="new">New Design - Create from scratch</MenuItem>
                                    <MenuItem value="upload">Upload Image - Provide reference images</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>

                        {pantsCreateType === 'upload' && (
                            <Box>
                                <Typography variant="subtitle2" sx={{mb: 1, fontWeight: '600'}}>
                                    Reference Images (Max 4)
                                </Typography>
                                <Box sx={{
                                    border: '2px dashed #ddd',
                                    borderRadius: '8px',
                                    p: 3,
                                    textAlign: 'center',
                                    backgroundColor: '#fafafa'
                                }}>
                                    <Button
                                        variant="outlined"
                                        component="label"
                                        sx={{mb: 2}}
                                        startIcon={<CloudUploadIcon/>}
                                    >
                                        Upload Pants Images
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/gif"
                                            multiple
                                            hidden
                                            onChange={e => handleImageUpload(e, uniformType, 'boy', 'pants')}
                                        />
                                    </Button>
                                    <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
                                        JPG, PNG, GIF, WEBP up to 10MB each
                                    </Typography>

                                    {pantsImages.length > 0 && (
                                        <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center'}}>
                                            {pantsImages.map((file, idx) => (
                                                <Box key={idx} sx={{
                                                    position: 'relative',
                                                    width: 80,
                                                    height: 80,
                                                    borderRadius: '8px',
                                                    overflow: 'hidden'
                                                }}>
                                                    <DisplayImage
                                                        imageUrl={URL.createObjectURL(file)}
                                                        alt={`preview-${idx}`}
                                                        width="80px"
                                                        height="80px"
                                                    />
                                                    <Button
                                                        size="small"
                                                        color="error"
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 2,
                                                            right: 2,
                                                            minWidth: 0,
                                                            width: 20,
                                                            height: 20,
                                                            borderRadius: '50%',
                                                            backgroundColor: 'rgba(255,255,255,0.9)',
                                                            fontSize: 12,
                                                            zIndex: 2
                                                        }}
                                                        onClick={() => handleRemoveImage(idx, uniformType, 'boy', 'pants')}
                                                    >
                                                        ×
                                                    </Button>
                                                </Box>
                                            ))}
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        )}
                        <Box sx={{display: 'grid', gap: 3}}>

                            <Box>
                                <Typography variant="subtitle2" sx={{
                                    mb: 1,
                                    fontWeight: '600',
                                    color: isFieldMissing(uniformType, 'boy', 'pantsFabric') ? '#d32f2f' : '#1e293b'
                                }}>
                                    Fabric Type *
                                </Typography>
                                <FormControl fullWidth size="small">
                                    <Select
                                        value={designRequest.uniformTypes[uniformType].details.boy.pants.fabric}
                                        onChange={(e) => {
                                            setDesignRequest(prev => ({
                                                ...prev,
                                                uniformTypes: {
                                                    ...prev.uniformTypes,
                                                    [uniformType]: {
                                                        ...prev.uniformTypes[uniformType],
                                                        details: {
                                                            ...prev.uniformTypes[uniformType].details,
                                                            boy: {
                                                                ...prev.uniformTypes[uniformType].details.boy,
                                                                pants: {
                                                                    ...prev.uniformTypes[uniformType].details.boy.pants,
                                                                    fabric: e.target.value
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }));
                                        }}
                                        displayEmpty
                                        renderValue={(selected) => {
                                            if (!selected) return <em>Select fabric type</em>;
                                            const fabric = uniformFabrics.find(f => f.id === selected);
                                            return fabric ? fabric.name : '';
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: isFieldMissing(uniformType, 'boy', 'pantsFabric') ? '#d32f2f' : '#c0c0c0',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: isFieldMissing(uniformType, 'boy', 'pantsFabric') ? '#d32f2f' : '#2e7d32',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: isFieldMissing(uniformType, 'boy', 'pantsFabric') ? '#d32f2f' : '#2e7d32',
                                                },
                                            },
                                        }}
                                        variant='outlined'>
                                        {uniformFabrics
                                            .filter(fabric => (fabric.type === 'pants' || fabric.type === 'skirt') && fabric.category === 'regular')
                                            .map((fabric, index) => (
                                                <MenuItem key={index} value={fabric.id}>
                                                    {fabric.name}
                                                </MenuItem>
                                            ))}
                                    </Select>
                                </FormControl>
                            </Box>


                            <Box>
                                <Typography variant="subtitle2" sx={{mb: 1, fontWeight: '600'}}>
                                    Color *
                                </Typography>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    p: 2,
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    backgroundColor: 'white'
                                }}>
                                    <ColorPicker
                                        value={designRequest.uniformTypes[uniformType].details.boy.pants.color}
                                        onChange={(color) => {
                                            setDesignRequest(prev => ({
                                                ...prev,
                                                uniformTypes: {
                                                    ...prev.uniformTypes,
                                                    [uniformType]: {
                                                        ...prev.uniformTypes[uniformType],
                                                        details: {
                                                            ...prev.uniformTypes[uniformType].details,
                                                            boy: {
                                                                ...prev.uniformTypes[uniformType].details.boy,
                                                                pants: {
                                                                    ...prev.uniformTypes[uniformType].details.boy.pants,
                                                                    color: color.toHexString()
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }));
                                        }}
                                        getPopupContainer={(triggerNode) => triggerNode?.parentElement || document.body}
                                        styles={{
                                            popupOverlayInner: {
                                                zIndex: 9999
                                            }
                                        }}
                                    />
                                    <Typography variant="body2" color="text.secondary">
                                        Selected: {designRequest.uniformTypes[uniformType].details.boy.pants.color}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                <Box sx={{
                    mt: 3,
                    p: 3,
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    backgroundColor: '#fafafa'
                }}>
                    <Typography variant="h6" sx={{
                        color: '#333',
                        mb: 2,
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}>
                        💭 Additional Notes (Pants)
                    </Typography>
                    <TextField
                        placeholder="Any special requirements or instructions for the pants design..."
                        value={designRequest.uniformTypes[uniformType].details.boy.pants.note}
                        onChange={(e) => {
                            setDesignRequest(prev => ({
                                ...prev,
                                uniformTypes: {
                                    ...prev.uniformTypes,
                                    [uniformType]: {
                                        ...prev.uniformTypes[uniformType],
                                        details: {
                                            ...prev.uniformTypes[uniformType].details,
                                            boy: {
                                                ...prev.uniformTypes[uniformType].details.boy,
                                                pants: {
                                                    ...prev.uniformTypes[uniformType].details.boy.pants,
                                                    note: e.target.value
                                                }
                                            }
                                        }
                                    }
                                }
                            }));
                        }}
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={3}
                        size="small"
                    />
                </Box>
            </>
        );
    };

    const renderGirlUniformDetails = (uniformType) => {
        const shirtCreateType = designRequest.uniformTypes[uniformType].details.girl.shirt.createType;
        const setShirtCreateType = (value) => {
            setDesignRequest(prev => ({
                ...prev,
                uniformTypes: {
                    ...prev.uniformTypes,
                    [uniformType]: {
                        ...prev.uniformTypes[uniformType],
                        details: {
                            ...prev.uniformTypes[uniformType].details,
                            girl: {
                                ...prev.uniformTypes[uniformType].details.girl,
                                shirt: {
                                    ...prev.uniformTypes[uniformType].details.girl.shirt,
                                    createType: value
                                }
                            }
                        }
                    }
                }
            }));
        };
        const bottomType = uniformType === "regular" ? designRequest.uniformTypes.regular.details.girl.bottomType : "pants";
        const bottomCreateType = designRequest.uniformTypes[uniformType].details.girl[bottomType].createType;
        const setBottomCreateType = (value) => {
            setDesignRequest(prev => ({
                ...prev,
                uniformTypes: {
                    ...prev.uniformTypes,
                    [uniformType]: {
                        ...prev.uniformTypes[uniformType],
                        details: {
                            ...prev.uniformTypes[uniformType].details,
                            girl: {
                                ...prev.uniformTypes[uniformType].details.girl,
                                [bottomType]: {
                                    ...prev.uniformTypes[uniformType].details.girl[bottomType],
                                    createType: value
                                }
                            }
                        }
                    }
                }
            }));
        };
        const shirtImages = designRequest.uniformTypes[uniformType].details.girl.shirt.images;
        const bottomImages = designRequest.uniformTypes[uniformType].details.girl[bottomType].images;
        return (
            <>

                <Box sx={{
                    mb: 3,
                    p: 3,
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    backgroundColor: '#fafafa'
                }}>
                    <Typography variant="h6" sx={{
                        color: '#333',
                        mb: 2,
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}>
                        👕 Shirt Configuration
                    </Typography>

                    <Box sx={{display: 'grid', gap: 3}}>

                        <Box>
                            <Typography variant="subtitle2" sx={{mb: 1, fontWeight: '600'}}>
                                Design Type *
                            </Typography>
                            <FormControl fullWidth size="small">
                                <Select
                                    value={shirtCreateType}
                                    onChange={e => setShirtCreateType(e.target.value)}
                                    displayEmpty
                                    renderValue={(selected) => {
                                        if (selected === '') {
                                            return 'Select design approach';
                                        }

                                        const options = {
                                            'new': 'New Design - Create from scratch',
                                            'upload': 'Upload Image - Provide reference images',
                                        };

                                        return options[selected];
                                    }}
                                    variant='outlined'>
                                    <MenuItem value="new">New Design - Create from scratch</MenuItem>
                                    <MenuItem value="upload">Upload Image - Provide reference images</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>


                        {shirtCreateType === 'upload' && (
                            <Box>
                                <Typography variant="subtitle2" sx={{mb: 1, fontWeight: '600'}}>
                                    Reference Images (Max 4)
                                </Typography>
                                <Box sx={{
                                    border: '2px dashed #ddd',
                                    borderRadius: '8px',
                                    p: 3,
                                    textAlign: 'center',
                                    backgroundColor: '#fafafa'
                                }}>
                                    <Button
                                        variant="outlined"
                                        component="label"
                                        sx={{mb: 2}}
                                        startIcon={<CloudUploadIcon/>}
                                    >
                                        Upload Shirt Images
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/gif"
                                            multiple
                                            hidden
                                            onChange={e => handleImageUpload(e, uniformType, 'girl', 'shirt')}
                                        />
                                    </Button>
                                    <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
                                        JPG, PNG, GIF, WEBP up to 10MB each
                                    </Typography>

                                    {shirtImages.length > 0 && (
                                        <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center'}}>
                                            {shirtImages.map((file, idx) => (
                                                <Box key={idx} sx={{
                                                    position: 'relative',
                                                    width: 80,
                                                    height: 80,
                                                    borderRadius: '8px',
                                                    overflow: 'hidden'
                                                }}>
                                                    <DisplayImage
                                                        imageUrl={URL.createObjectURL(file)}
                                                        alt={`preview-${idx}`}
                                                        width="80px"
                                                        height="80px"
                                                    />
                                                    <Button
                                                        size="small"
                                                        color="error"
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 2,
                                                            right: 2,
                                                            minWidth: 0,
                                                            width: 20,
                                                            height: 20,
                                                            borderRadius: '50%',
                                                            backgroundColor: 'rgba(255,255,255,0.9)',
                                                            fontSize: 12,
                                                            zIndex: 2
                                                        }}
                                                        onClick={() => handleRemoveImage(idx, uniformType, 'girl', 'shirt')}
                                                    >
                                                        ×
                                                    </Button>
                                                </Box>
                                            ))}
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        )}


                        <Box>
                            <Typography variant="subtitle2" sx={{
                                mb: 1,
                                fontWeight: '600',
                                color: isFieldMissing(uniformType, 'girl', 'shirtFabric') ? '#d32f2f' : '#1e293b'
                            }}>
                                Fabric Type *
                            </Typography>
                            <FormControl fullWidth size="small">
                                <Select
                                    value={designRequest.uniformTypes[uniformType].details.girl.shirt.fabric}
                                    onChange={(e) => {
                                        setDesignRequest(prev => ({
                                            ...prev,
                                            uniformTypes: {
                                                ...prev.uniformTypes,
                                                [uniformType]: {
                                                    ...prev.uniformTypes[uniformType],
                                                    details: {
                                                        ...prev.uniformTypes[uniformType].details,
                                                        girl: {
                                                            ...prev.uniformTypes[uniformType].details.girl,
                                                            shirt: {
                                                                ...prev.uniformTypes[uniformType].details.girl.shirt,
                                                                fabric: e.target.value
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }));
                                    }}
                                    displayEmpty
                                    renderValue={(selected) => {
                                        if (!selected) return <em>Select fabric type</em>;
                                        const fabric = uniformFabrics.find(f => f.id === selected);
                                        return fabric ? fabric.name : '';
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: isFieldMissing(uniformType, 'girl', 'shirtFabric') ? '#d32f2f' : '#c0c0c0',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: isFieldMissing(uniformType, 'girl', 'shirtFabric') ? '#d32f2f' : '#2e7d32',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: isFieldMissing(uniformType, 'girl', 'shirtFabric') ? '#d32f2f' : '#2e7d32',
                                            },
                                        },
                                    }}
                                    variant='outlined'>
                                    {uniformFabrics
                                        .filter(fabric => fabric.type === 'shirt' && fabric.category === (uniformType === 'regular' ? 'regular' : 'pe'))
                                        .map((fabric, index) => (
                                            <MenuItem key={index} value={fabric.id}>
                                                {fabric.name}
                                            </MenuItem>
                                        ))}
                                </Select>
                            </FormControl>
                        </Box>


                        <Box>
                            <Typography variant="subtitle2" sx={{mb: 1, fontWeight: '600'}}>
                                Color *
                            </Typography>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                p: 2,
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                backgroundColor: 'white'
                            }}>
                                <ColorPicker
                                    value={designRequest.uniformTypes[uniformType].details.girl.shirt.color}
                                    onChange={(color) => {
                                        setDesignRequest(prev => ({
                                            ...prev,
                                            uniformTypes: {
                                                ...prev.uniformTypes,
                                                [uniformType]: {
                                                    ...prev.uniformTypes[uniformType],
                                                    details: {
                                                        ...prev.uniformTypes[uniformType].details,
                                                        girl: {
                                                            ...prev.uniformTypes[uniformType].details.girl,
                                                            shirt: {
                                                                ...prev.uniformTypes[uniformType].details.girl.shirt,
                                                                color: color.toHexString()
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }));
                                    }}
                                    getPopupContainer={(triggerNode) => triggerNode?.parentElement || document.body}
                                    styles={{
                                        popupOverlayInner: {
                                            zIndex: 9999
                                        }
                                    }}
                                />
                                <Typography variant="body2" color="text.secondary">
                                    Selected: {designRequest.uniformTypes[uniformType].details.girl.shirt.color}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>


                <Box sx={{
                    mb: 3,
                    p: 3,
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    backgroundColor: '#fafafa'
                }}>
                    <Typography variant="h6" sx={{
                        color: '#333',
                        mb: 2,
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}>
                        Logo Placement
                    </Typography>

                    <Box sx={{display: 'grid', gap: 2}}>
                        <Box sx={{display: 'flex', gap: 2, alignItems: 'center'}}>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => setIsLogoImagePopupOpen(true)}
                                sx={{whiteSpace: 'nowrap'}}
                            >
                                📋 View Guide
                            </Button>
                            <Typography variant="body2" color="text.secondary">
                                Click to see logo placement options
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="subtitle2" sx={{
                                mb: 1,
                                fontWeight: '600',
                                color: isFieldMissing(uniformType, 'girl', 'shirtLogoPlacement') ? '#d32f2f' : '#1e293b'
                            }}>
                                Placement Position *
                            </Typography>
                            <FormControl fullWidth size="small">
                                <Select
                                    value={designRequest.uniformTypes[uniformType].details.girl.shirt.logoPlacement}
                                    onChange={(e) => {
                                        setDesignRequest(prev => ({
                                            ...prev,
                                            uniformTypes: {
                                                ...prev.uniformTypes,
                                                [uniformType]: {
                                                    ...prev.uniformTypes[uniformType],
                                                    details: {
                                                        ...prev.uniformTypes[uniformType].details,
                                                        girl: {
                                                            ...prev.uniformTypes[uniformType].details.girl,
                                                            shirt: {
                                                                ...prev.uniformTypes[uniformType].details.girl.shirt,
                                                                logoPlacement: e.target.value
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }));
                                    }}
                                    displayEmpty
                                    renderValue={(selected) => selected || 'Select logo placement'}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: isFieldMissing(uniformType, 'girl', 'shirtLogoPlacement') ? '#d32f2f' : '#c0c0c0',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: isFieldMissing(uniformType, 'girl', 'shirtLogoPlacement') ? '#d32f2f' : '#2e7d32',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: isFieldMissing(uniformType, 'girl', 'shirtLogoPlacement') ? '#d32f2f' : '#2e7d32',
                                            },
                                        },
                                    }}
                                    variant='outlined'>
                                    <MenuItem value="">
                                        <em>No logo placement</em>
                                    </MenuItem>
                                    <MenuItem value="Left Sleeve">Left Sleeve</MenuItem>
                                    <MenuItem value="Right Sleeve">Right Sleeve</MenuItem>
                                    <MenuItem value="Left Chest">Left Chest</MenuItem>
                                    <MenuItem value="Right Chest">Right Chest</MenuItem>
                                    <MenuItem value="Front Hip">Front Hip</MenuItem>
                                    <MenuItem value="Back Neck">Back Neck</MenuItem>
                                    <MenuItem value="Back Through Shoulders">Back Through Shoulders</MenuItem>
                                    <MenuItem value="Center Back">Center Back</MenuItem>
                                    <MenuItem value="Bottom Back">Bottom Back</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </Box>
                </Box>

                <Dialog
                    open={isLogoImagePopupOpen}
                    onClose={() => setIsLogoImagePopupOpen(false)}
                    maxWidth="md"
                    fullWidth
                    sx={{
                        '& .MuiDialog-paper': {
                            borderRadius: '12px'
                        }
                    }}
                >
                    <DialogTitle sx={{
                        textAlign: 'center',
                        fontWeight: '600',
                        color: '#333'
                    }}>
                        Logo Placement Guide
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            p: 2
                        }}>
                            <img
                                src="/logoPos.png"
                                alt="Logo Placement Guide"
                                style={{
                                    maxWidth: '100%',
                                    height: 'auto',
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{p: 2, justifyContent: 'center'}}>
                        <Button
                            onClick={() => setIsLogoImagePopupOpen(false)}
                            variant="contained"
                            sx={{px: 4}}
                        >
                            Got it
                        </Button>
                    </DialogActions>
                </Dialog>

                <Box sx={{
                    mb: 3,
                    p: 3,
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    backgroundColor: '#fafafa'
                }}>
                    <Typography variant="h6" sx={{
                        color: '#333',
                        mb: 2,
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}>
                        💭 Additional Notes (Shirt)
                    </Typography>
                    <TextField
                        placeholder="Any special requirements or instructions for the shirt design..."
                        value={designRequest.uniformTypes[uniformType].details.girl.shirt.note}
                        onChange={(e) => {
                            setDesignRequest(prev => ({
                                ...prev,
                                uniformTypes: {
                                    ...prev.uniformTypes,
                                    [uniformType]: {
                                        ...prev.uniformTypes[uniformType],
                                        details: {
                                            ...prev.uniformTypes[uniformType].details,
                                            girl: {
                                                ...prev.uniformTypes[uniformType].details.girl,
                                                shirt: {
                                                    ...prev.uniformTypes[uniformType].details.girl.shirt,
                                                    note: e.target.value
                                                }
                                            }
                                        }
                                    }
                                }
                            }));
                        }}
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={3}
                        size="small"
                    />
                </Box>

                <Divider sx={{my: 4, borderColor: '#ddd'}}/>


                {uniformType === "regular" && (
                    <Box sx={{
                        mb: 3,
                        p: 3,
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        backgroundColor: '#fafafa'
                    }}>
                        <Typography variant="h6" sx={{
                            color: '#333',
                            mb: 2,
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }}>
                            👗 Bottom Type Selection
                        </Typography>
                        <FormControl component="fieldset" fullWidth>
                            <FormLabel component="legend" sx={{
                                mb: 1,
                                fontWeight: '600',
                                color: isFieldMissing(uniformType, 'girl', 'bottomType') ? '#d32f2f' : '#1e293b'
                            }}>
                                Choose Bottom Type *
                            </FormLabel>
                            <RadioGroup
                                row
                                name="regular-girl-bottom-type"
                                value={designRequest.uniformTypes.regular.details.girl.bottomType}
                                onChange={(e) => {
                                    setDesignRequest(prev => ({
                                        ...prev,
                                        uniformTypes: {
                                            ...prev.uniformTypes,
                                            regular: {
                                                ...prev.uniformTypes.regular,
                                                details: {
                                                    ...prev.uniformTypes.regular.details,
                                                    girl: {
                                                        ...prev.uniformTypes.regular.details.girl,
                                                        bottomType: e.target.value
                                                    }
                                                }
                                            }
                                        }
                                    }));
                                }}
                            >
                                <FormControlLabel value="pants" control={<Radio/>} label="Pants"/>
                                <FormControlLabel value="skirt" control={<Radio/>} label="Skirt"/>
                            </RadioGroup>
                        </FormControl>
                    </Box>
                )}


                <Box sx={{
                    mb: 3,
                    p: 3,
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    backgroundColor: '#fafafa'
                }}>
                    <Typography variant="h6" sx={{
                        color: '#333',
                        mb: 2,
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}>
                        {uniformType === "regular" && designRequest.uniformTypes.regular.details.girl.bottomType === "skirt" ? "👗" : "👖"} {uniformType === "regular" && designRequest.uniformTypes.regular.details.girl.bottomType === "skirt" ? "Skirt" : "Pants"} Configuration
                    </Typography>

                    <Box sx={{display: 'grid', gap: 3}}>

                        <Box>
                            <Typography variant="subtitle2" sx={{mb: 1, fontWeight: '600'}}>
                                Design Type *
                            </Typography>
                            <FormControl fullWidth size="small">
                                <Select
                                    value={bottomCreateType}
                                    onChange={e => setBottomCreateType(e.target.value)}
                                    displayEmpty
                                    renderValue={(selected) => {
                                        if (selected === '') {
                                            return 'Select design approach';
                                        }

                                        const options = {
                                            'new': 'New Design - Create from scratch',
                                            'upload': 'Upload Image - Provide reference images',
                                        };

                                        return options[selected];
                                    }}
                                    variant='outlined'>
                                    <MenuItem value="new">New Design - Create from scratch</MenuItem>
                                    <MenuItem value="upload">Upload Image - Provide reference images</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>


                        {bottomCreateType === 'upload' && (
                            <Box>
                                <Typography variant="subtitle2" sx={{mb: 1, fontWeight: '600'}}>
                                    Reference Images (Max 4)
                                </Typography>
                                <Box sx={{
                                    border: '2px dashed #ddd',
                                    borderRadius: '8px',
                                    p: 3,
                                    textAlign: 'center',
                                    backgroundColor: '#fafafa'
                                }}>
                                    <Button
                                        variant="outlined"
                                        component="label"
                                        sx={{mb: 2}}
                                        startIcon={<CloudUploadIcon/>}
                                    >
                                        Upload {uniformType === "regular" && designRequest.uniformTypes.regular.details.girl.bottomType === "skirt" ? "Skirt" : "Pants"} Images
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/gif"
                                            multiple
                                            hidden
                                            onChange={e => handleImageUpload(e, uniformType, 'girl', bottomType)}
                                        />
                                    </Button>
                                    <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
                                        JPG, PNG, GIF, WEBP up to 10MB each
                                    </Typography>

                                    {bottomImages.length > 0 && (
                                        <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center'}}>
                                            {bottomImages.map((file, idx) => (
                                                <Box key={idx} sx={{
                                                    position: 'relative',
                                                    width: 80,
                                                    height: 80,
                                                    borderRadius: '8px',
                                                    overflow: 'hidden'
                                                }}>
                                                    <DisplayImage
                                                        imageUrl={URL.createObjectURL(file)}
                                                        alt={`preview-${idx}`}
                                                        width="80px"
                                                        height="80px"
                                                    />
                                                    <Button
                                                        size="small"
                                                        color="error"
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 2,
                                                            right: 2,
                                                            minWidth: 0,
                                                            width: 20,
                                                            height: 20,
                                                            borderRadius: '50%',
                                                            backgroundColor: 'rgba(255,255,255,0.9)',
                                                            fontSize: 12,
                                                            zIndex: 2
                                                        }}
                                                        onClick={() => handleRemoveImage(idx, uniformType, 'girl', bottomType)}
                                                    >
                                                        ×
                                                    </Button>
                                                </Box>
                                            ))}
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        )}


                        <Box>
                            <Typography variant="subtitle2" sx={{
                                mb: 1,
                                fontWeight: '600',
                                color: isFieldMissing(uniformType, 'girl', uniformType === 'regular' ? 'bottomFabric' : 'pantsFabric') ? '#d32f2f' : '#1e293b'
                            }}>
                                Fabric Type *
                            </Typography>
                            <FormControl fullWidth size="small">
                                <Select
                                    value={
                                        uniformType === "regular" && designRequest.uniformTypes.regular.details.girl.bottomType === "skirt"
                                            ? designRequest.uniformTypes[uniformType].details.girl.skirt.fabric
                                            : designRequest.uniformTypes[uniformType].details.girl.pants.fabric
                                    }
                                    onChange={(e) => {
                                        const bottomType = uniformType === "regular" ? designRequest.uniformTypes.regular.details.girl.bottomType : "pants";
                                        const fabricField = bottomType === "pants" ? "pants" : "skirt";
                                        setDesignRequest(prev => ({
                                            ...prev,
                                            uniformTypes: {
                                                ...prev.uniformTypes,
                                                [uniformType]: {
                                                    ...prev.uniformTypes[uniformType],
                                                    details: {
                                                        ...prev.uniformTypes[uniformType].details,
                                                        girl: {
                                                            ...prev.uniformTypes[uniformType].details.girl,
                                                            [fabricField]: {
                                                                ...prev.uniformTypes[uniformType].details.girl[fabricField],
                                                                fabric: e.target.value
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }));
                                    }}
                                    displayEmpty
                                    renderValue={(selected) => {
                                        if (!selected) return <em>Select fabric type</em>;
                                        const fabric = uniformFabrics.find(f => f.id === selected);
                                        return fabric ? fabric.name : '';
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: isFieldMissing(uniformType, 'girl', uniformType === 'regular' ? 'bottomFabric' : 'pantsFabric') ? '#d32f2f' : '#c0c0c0',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: isFieldMissing(uniformType, 'girl', uniformType === 'regular' ? 'bottomFabric' : 'pantsFabric') ? '#d32f2f' : '#2e7d32',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: isFieldMissing(uniformType, 'girl', uniformType === 'regular' ? 'bottomFabric' : 'pantsFabric') ? '#d32f2f' : '#2e7d32',
                                            },
                                        },
                                    }}
                                    variant='outlined'>
                                    {uniformFabrics
                                        .filter(fabric => {
                                            if (uniformType === "regular" && designRequest.uniformTypes.regular.details.girl.bottomType === "skirt") {
                                                return fabric.type === 'skirt' && fabric.category === 'regular';
                                            } else {
                                                return fabric.type === 'pants' && fabric.category === (uniformType === 'regular' ? 'regular' : 'pe');
                                            }
                                        })
                                        .map((fabric, index) => (
                                            <MenuItem key={index} value={fabric.id}>
                                                {fabric.name}
                                            </MenuItem>
                                        ))}
                                </Select>
                            </FormControl>
                        </Box>


                        <Box>
                            <Typography variant="subtitle2" sx={{mb: 1, fontWeight: '600'}}>
                                Color *
                            </Typography>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                p: 2,
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                backgroundColor: 'white'
                            }}>
                                <ColorPicker
                                    value={
                                        uniformType === "regular" && designRequest.uniformTypes.regular.details.girl.bottomType === "skirt"
                                            ? designRequest.uniformTypes[uniformType].details.girl.skirt.color
                                            : designRequest.uniformTypes[uniformType].details.girl.pants.color
                                    }
                                    onChange={(color) => {
                                        const bottomType = uniformType === "regular" ? designRequest.uniformTypes.regular.details.girl.bottomType : "pants";
                                        const colorField = bottomType === "pants" ? "pants" : "skirt";
                                        setDesignRequest(prev => ({
                                            ...prev,
                                            uniformTypes: {
                                                ...prev.uniformTypes,
                                                [uniformType]: {
                                                    ...prev.uniformTypes[uniformType],
                                                    details: {
                                                        ...prev.uniformTypes[uniformType].details,
                                                        girl: {
                                                            ...prev.uniformTypes[uniformType].details.girl,
                                                            [colorField]: {
                                                                ...prev.uniformTypes[uniformType].details.girl[colorField],
                                                                color: color.toHexString()
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }));
                                    }}
                                    getPopupContainer={(triggerNode) => triggerNode?.parentElement || document.body}
                                    styles={{
                                        popupOverlayInner: {
                                            zIndex: 9999
                                        }
                                    }}
                                />
                                <Typography variant="body2" color="text.secondary">
                                    Selected: {uniformType === "regular" && designRequest.uniformTypes.regular.details.girl.bottomType === "skirt"
                                    ? designRequest.uniformTypes[uniformType].details.girl.skirt.color
                                    : designRequest.uniformTypes[uniformType].details.girl.pants.color}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>


                <Box sx={{
                    mt: 3,
                    p: 3,
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    backgroundColor: '#fafafa'
                }}>
                    <Typography variant="h6" sx={{
                        color: '#333',
                        mb: 2,
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}>
                        💭 Additional Notes
                        ({uniformType === "regular" && designRequest.uniformTypes.regular.details.girl.bottomType === "skirt" ? "Skirt" : "Pants"})
                    </Typography>
                    <TextField
                        placeholder={`Any special requirements or instructions for the ${uniformType === "regular" && designRequest.uniformTypes.regular.details.girl.bottomType === "skirt" ? "skirt" : "pants"} design...`}
                        value={
                            uniformType === "regular" && designRequest.uniformTypes.regular.details.girl.bottomType === "skirt"
                                ? designRequest.uniformTypes[uniformType].details.girl.skirt.note
                                : designRequest.uniformTypes[uniformType].details.girl.pants.note
                        }
                        onChange={(e) => {
                            const bottomType = uniformType === "regular" ? designRequest.uniformTypes.regular.details.girl.bottomType : "pants";
                            const noteField = bottomType === "pants" ? "pants" : "skirt";
                            setDesignRequest(prev => ({
                                ...prev,
                                uniformTypes: {
                                    ...prev.uniformTypes,
                                    [uniformType]: {
                                        ...prev.uniformTypes[uniformType],
                                        details: {
                                            ...prev.uniformTypes[uniformType].details,
                                            girl: {
                                                ...prev.uniformTypes[uniformType].details.girl,
                                                [noteField]: {
                                                    ...prev.uniformTypes[uniformType].details.girl[noteField],
                                                    note: e.target.value
                                                }
                                            }
                                        }
                                    }
                                }
                            }));
                        }}
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={3}
                        size="small"
                    />
                </Box>
            </>
        );
    };

    return (
        <Box sx={{height: '100%', overflowY: 'auto'}}>

            <Box
                sx={{
                    mb: 4,
                    position: "relative",
                    p: 4,
                    borderRadius: 3,
                    background: "linear-gradient(135deg, rgba(46, 125, 50, 0.05) 0%, rgba(27, 94, 32, 0.08) 100%)",
                    border: "1px solid rgba(46, 125, 50, 0.1)",
                    "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "url('/unisew.jpg') center/cover",
                        opacity: 0.15,
                        borderRadius: 3,
                        zIndex: -1
                    }
                }}
            >
                <Box sx={{display: "flex", alignItems: "center", mb: 2}}>
                    <DesignServicesIcon sx={{fontSize: 32, mr: 2, color: "#2e7d32"}}/>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            color: "#1e293b",
                            fontSize: {xs: "1.5rem", md: "2rem"}
                        }}
                    >
                        Create Design Request
                    </Typography>
                </Box>
                <Typography
                    variant="body1"
                    sx={{
                        color: "#64748b",
                        fontSize: "1rem",
                        lineHeight: 1.6,
                        mb: 3
                    }}
                >
                    Submit a new uniform design request for your school. Design and customize uniforms for your
                    students.
                </Typography>
            </Box>


            <Box sx={{
                backgroundColor: 'white',
                borderRadius: 2,
                p: 4,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid #e2e8f0'
            }}>

                <Box sx={{mb: 4}}>
                    <Typography variant="h6" sx={{
                        color: '#1e293b',
                        mb: 2,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}>
                        📝 Design Information
                    </Typography>
                    <TextField
                        required
                        id="design-name"
                        label="Design Name"
                        placeholder="Enter a name for your uniform design"
                        value={designRequest.designName}
                        onChange={(e) => setDesignRequest(prev => ({...prev, designName: e.target.value}))}
                        variant="outlined"
                        fullWidth
                        size="medium"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#2e7d32'
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#2e7d32'
                                }
                            },
                            '& .MuiInputLabel-root': {
                                '&.Mui-focused': {
                                    color: '#2e7d32'
                                }
                            },
                            '& .MuiFormLabel-root': {
                                '&.Mui-focused': {
                                    color: '#2e7d32'
                                }
                            }
                        }}
                    />
                </Box>
                <Box
                    component="form"
                    sx={{
                        '& .MuiTextField-root': {my: 1, mx: 0, width: '100%'},
                    }}
                    noValidate
                    autoComplete="off"
                >

                    <Box sx={{mb: 4}}>
                        <Typography variant="h6" sx={{
                            color: '#1e293b',
                            mb: 2,
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }}>
                            🏫 School Logo
                        </Typography>
                        <Box sx={{
                            border: '2px dashed #cbd5e1',
                            borderRadius: 2,
                            p: 3,
                            textAlign: 'center',
                            backgroundColor: '#f8fafc',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                borderColor: '#2e7d32',
                                backgroundColor: '#f0f9ff'
                            }
                        }}>
                            <input
                                accept="image/*"
                                style={{display: 'none'}}
                                id="raised-button-file"
                                type="file"
                                onChange={handleFileChange}
                            />
                            <label htmlFor="raised-button-file">
                                <Button
                                    variant="contained"
                                    component="span"
                                    startIcon={<CloudUploadIcon/>}
                                    sx={{
                                        mb: 2,
                                        background: "linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)",
                                        '&:hover': {
                                            background: "linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)"
                                        }
                                    }}
                                >
                                    Upload Logo
                                </Button>
                            </label>
                            <Typography variant="body2" sx={{color: '#64748b'}}>
                                Supported formats: JPG, PNG, GIF, WEBP (Max 5MB)
                            </Typography>
                            {designRequest.logo.preview && (
                                <Box sx={{mt: 2}}>
                                    <DisplayImage
                                        imageUrl={designRequest.logo.preview}
                                        alt="Logo Preview"
                                        width="150px"
                                        height="auto"
                                    />
                                </Box>
                            )}
                        </Box>
                    </Box>


                    <Box sx={{mb: 4}}>
                        <Typography variant="h6" sx={{
                            color: '#1e293b',
                            mb: 2,
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }}>
                            👕 Uniform Type *
                        </Typography>
                        <Box sx={{
                            border: '1px solid #e2e8f0',
                            borderRadius: 2,
                            overflow: 'hidden',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                        }}>
                            <Box
                                onClick={() => handleUniformChange("regular")}
                                sx={{
                                    p: 3,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    backgroundColor: designRequest.uniformTypes.regular.selected ? '#e8f5e8' : '#fff',
                                    borderBottom: '1px solid #e2e8f0',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        backgroundColor: designRequest.uniformTypes.regular.selected ? '#e8f5e8' : '#f8fafc'
                                    }
                                }}
                            >
                                <Checkbox
                                    checked={designRequest.uniformTypes.regular.selected}
                                    name="regular-uniform"
                                    sx={{
                                        p: 0,
                                        pointerEvents: 'none',
                                        color: '#2e7d32',
                                        '&.Mui-checked': {
                                            color: '#2e7d32'
                                        }
                                    }}
                                />
                                <Box sx={{flex: 1, pointerEvents: 'none'}}>
                                    <Typography variant="body1" sx={{fontWeight: 600, mb: 0.5, color: '#1e293b'}}>
                                        Regular Uniform
                                    </Typography>
                                    <Typography variant="body2" sx={{color: '#64748b'}}>
                                        Daily wear uniform for regular school activities
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    fontSize: '1.5rem',
                                    opacity: designRequest.uniformTypes.regular.selected ? 1 : 0.3,
                                    pointerEvents: 'none'
                                }}>
                                    👔
                                </Box>
                            </Box>

                            <Box
                                onClick={() => handleUniformChange("physicalEducation")}
                                sx={{
                                    p: 3,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    backgroundColor: designRequest.uniformTypes.physicalEducation.selected ? '#e8f5e8' : '#fff',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        backgroundColor: designRequest.uniformTypes.physicalEducation.selected ? '#e8f5e8' : '#f8fafc'
                                    }
                                }}
                            >
                                <Checkbox
                                    checked={designRequest.uniformTypes.physicalEducation.selected}
                                    name="physical-education-uniform"
                                    sx={{
                                        p: 0,
                                        pointerEvents: 'none',
                                        color: '#2e7d32',
                                        '&.Mui-checked': {
                                            color: '#2e7d32'
                                        }
                                    }}
                                />
                                <Box sx={{flex: 1, pointerEvents: 'none'}}>
                                    <Typography variant="body1" sx={{fontWeight: 600, mb: 0.5, color: '#1e293b'}}>
                                        Physical Education Uniform
                                    </Typography>
                                    <Typography variant="body2" sx={{color: '#64748b'}}>
                                        Sports uniform for physical education and athletic activities
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    fontSize: '1.5rem',
                                    opacity: designRequest.uniformTypes.physicalEducation.selected ? 1 : 0.3,
                                    pointerEvents: 'none'
                                }}>
                                    🏃‍
                                </Box>
                            </Box>
                        </Box>
                    </Box>

                    {designRequest.uniformTypes.regular.selected && (
                        <>
                            <Box sx={{mb: 4}}>
                                <Typography variant="h6" sx={{
                                    color: '#1e293b',
                                    mb: 2,
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}>
                                    Gender Selection (Regular Uniform) *
                                </Typography>
                                <Box sx={{
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '8px',
                                    overflow: 'hidden'
                                }}>
                                    <Box sx={{
                                        p: 3,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        backgroundColor: designRequest.uniformTypes.regular.genders.boy ? '#e3f2fd' : '#fff',
                                        borderBottom: '1px solid #e0e0e0',
                                        transition: 'all 0.2s ease'
                                    }}>
                                        <Box
                                            onClick={() => handleGenderChange("regular", "boy")}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 2,
                                                cursor: 'pointer',
                                                flex: 1
                                            }}
                                        >
                                            <Checkbox
                                                checked={designRequest.uniformTypes.regular.genders.boy}
                                                name="regular-boy"
                                                color="primary"
                                                sx={{
                                                    p: 0,
                                                    pointerEvents: 'none'
                                                }}
                                            />
                                            <Box sx={{flex: 1, pointerEvents: 'none'}}>
                                                <Typography variant="body1" sx={{fontWeight: '600', mb: 0.5}}>
                                                    Boy
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Design uniform for male students
                                                </Typography>
                                                {designRequest.uniformTypes.regular.genders.boy && (
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            color: isBoyInfoComplete('regular') ? '#2e7d32' : '#d32f2f',
                                                            fontWeight: '600',
                                                            fontSize: '0.75rem',
                                                            mt: 0.5,
                                                            display: 'block'
                                                        }}
                                                    >
                                                        {isBoyInfoComplete('regular') ? 'All information filled' : 'Information missing'}
                                                    </Typography>
                                                )}
                                            </Box>
                                            <Box sx={{
                                                fontSize: '1.5rem',
                                                opacity: designRequest.uniformTypes.regular.genders.boy ? 1 : 0.3,
                                                pointerEvents: 'none'
                                            }}>
                                                👦
                                            </Box>
                                        </Box>
                                        {designRequest.uniformTypes.regular.genders.boy && (
                                            <Button
                                                variant="contained"
                                                size="small"
                                                onClick={() => setDesignRequest(prev => ({
                                                    ...prev,
                                                    uniformTypes: {
                                                        ...prev.uniformTypes,
                                                        regular: {
                                                            ...prev.uniformTypes.regular,
                                                            details: {
                                                                ...prev.uniformTypes.regular.details,
                                                                boy: {
                                                                    ...prev.uniformTypes.regular.details.boy,
                                                                    showForm: true
                                                                }
                                                            }
                                                        }
                                                    }
                                                }))}
                                                sx={{
                                                    ml: 2,
                                                    backgroundColor: '#1976d2',
                                                    '&:hover': {
                                                        backgroundColor: '#1565c0'
                                                    }
                                                }}
                                            >
                                                Configure Details
                                            </Button>
                                        )}
                                    </Box>

                                    <Box sx={{
                                        p: 3,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        backgroundColor: designRequest.uniformTypes.regular.genders.girl ? '#fce4ec' : '#fff',
                                        transition: 'all 0.2s ease'
                                    }}>
                                        <Box
                                            onClick={() => handleGenderChange("regular", "girl")}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 2,
                                                cursor: 'pointer',
                                                flex: 1
                                            }}
                                        >
                                            <Checkbox
                                                checked={designRequest.uniformTypes.regular.genders.girl}
                                                name="regular-girl"
                                                color="primary"
                                                sx={{
                                                    p: 0,
                                                    pointerEvents: 'none'
                                                }}
                                            />
                                            <Box sx={{flex: 1, pointerEvents: 'none'}}>
                                                <Typography variant="body1" sx={{fontWeight: '600', mb: 0.5}}>
                                                    Girl
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Design uniform for female students
                                                </Typography>
                                                {designRequest.uniformTypes.regular.genders.girl && (
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            color: isGirlInfoComplete('regular') ? '#2e7d32' : '#d32f2f',
                                                            fontWeight: '600',
                                                            fontSize: '0.75rem',
                                                            mt: 0.5,
                                                            display: 'block'
                                                        }}
                                                    >
                                                        {isGirlInfoComplete('regular') ? 'All information filled' : 'Information missing'}
                                                    </Typography>
                                                )}
                                            </Box>
                                            <Box sx={{
                                                fontSize: '1.5rem',
                                                opacity: designRequest.uniformTypes.regular.genders.girl ? 1 : 0.3,
                                                pointerEvents: 'none'
                                            }}>
                                                👧
                                            </Box>
                                        </Box>
                                        {designRequest.uniformTypes.regular.genders.girl && (
                                            <Button
                                                variant="contained"
                                                size="small"
                                                onClick={() => setDesignRequest(prev => ({
                                                    ...prev,
                                                    uniformTypes: {
                                                        ...prev.uniformTypes,
                                                        regular: {
                                                            ...prev.uniformTypes.regular,
                                                            details: {
                                                                ...prev.uniformTypes.regular.details,
                                                                girl: {
                                                                    ...prev.uniformTypes.regular.details.girl,
                                                                    showForm: true
                                                                }
                                                            }
                                                        }
                                                    }
                                                }))}
                                                sx={{
                                                    ml: 2,
                                                    backgroundColor: '#1976d2',
                                                    '&:hover': {
                                                        backgroundColor: '#1565c0'
                                                    }
                                                }}
                                            >
                                                Configure Details
                                            </Button>
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                            <Dialog open={designRequest.uniformTypes.regular.details.boy.showForm}
                                    onClose={() => setDesignRequest(prev => ({
                                        ...prev,
                                        uniformTypes: {
                                            ...prev.uniformTypes,
                                            regular: {
                                                ...prev.uniformTypes.regular,
                                                details: {
                                                    ...prev.uniformTypes.regular.details,
                                                    boy: {...prev.uniformTypes.regular.details.boy, showForm: false}
                                                }
                                            }
                                        }
                                    }))} maxWidth="md" fullWidth>
                                <DialogTitle>Regular Uniform Details (Boy)</DialogTitle>
                                <DialogContent>
                                    {renderBoyUniformDetails("regular")}
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={() => setDesignRequest(prev => ({
                                        ...prev,
                                        uniformTypes: {
                                            ...prev.uniformTypes,
                                            regular: {
                                                ...prev.uniformTypes.regular,
                                                details: {
                                                    ...prev.uniformTypes.regular.details,
                                                    boy: {...prev.uniformTypes.regular.details.boy, showForm: false}
                                                }
                                            }
                                        }
                                    }))}>Close</Button>
                                </DialogActions>
                            </Dialog>
                            <Dialog open={designRequest.uniformTypes.regular.details.girl.showForm}
                                    onClose={() => setDesignRequest(prev => ({
                                        ...prev,
                                        uniformTypes: {
                                            ...prev.uniformTypes,
                                            regular: {
                                                ...prev.uniformTypes.regular,
                                                details: {
                                                    ...prev.uniformTypes.regular.details,
                                                    girl: {
                                                        ...prev.uniformTypes.regular.details.girl,
                                                        showForm: false
                                                    }
                                                }
                                            }
                                        }
                                    }))} maxWidth="md" fullWidth>
                                <DialogTitle>Regular Uniform Details (Girl)</DialogTitle>
                                <DialogContent>
                                    {renderGirlUniformDetails("regular")}
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={() => setDesignRequest(prev => ({
                                        ...prev,
                                        uniformTypes: {
                                            ...prev.uniformTypes,
                                            regular: {
                                                ...prev.uniformTypes.regular,
                                                details: {
                                                    ...prev.uniformTypes.regular.details,
                                                    girl: {
                                                        ...prev.uniformTypes.regular.details.girl,
                                                        showForm: false
                                                    }
                                                }
                                            }
                                        }
                                    }))}>Close</Button>
                                </DialogActions>
                            </Dialog>
                        </>
                    )}

                    {designRequest.uniformTypes.physicalEducation.selected && (
                        <>
                            <Box sx={{mb: 4}}>
                                <Typography variant="h6" sx={{
                                    color: '#333',
                                    mb: 2,
                                    fontWeight: '600'
                                }}>
                                    Gender Selection (Physical Education Uniform) *
                                </Typography>
                                <Box sx={{
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '8px',
                                    overflow: 'hidden'
                                }}>
                                    <Box sx={{
                                        p: 3,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        backgroundColor: designRequest.uniformTypes.physicalEducation.genders.boy ? '#e8f5e9' : '#fff',
                                        borderBottom: '1px solid #e0e0e0',
                                        transition: 'all 0.2s ease'
                                    }}>
                                        <Box
                                            onClick={() => handleGenderChange("physicalEducation", "boy")}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 2,
                                                cursor: 'pointer',
                                                flex: 1
                                            }}
                                        >
                                            <Checkbox
                                                checked={designRequest.uniformTypes.physicalEducation.genders.boy}
                                                name="physical-boy"
                                                color="primary"
                                                sx={{
                                                    p: 0,
                                                    pointerEvents: 'none'
                                                }}
                                            />
                                            <Box sx={{flex: 1, pointerEvents: 'none'}}>
                                                <Typography variant="body1" sx={{fontWeight: '600', mb: 0.5}}>
                                                    Boy
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Physical education uniform for male students
                                                </Typography>
                                                {designRequest.uniformTypes.physicalEducation.genders.boy && (
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            color: isBoyInfoComplete('physicalEducation') ? '#2e7d32' : '#d32f2f',
                                                            fontWeight: '600',
                                                            fontSize: '0.75rem',
                                                            mt: 0.5,
                                                            display: 'block'
                                                        }}
                                                    >
                                                        {isBoyInfoComplete('physicalEducation') ? 'All information filled' : 'Information missing'}
                                                    </Typography>
                                                )}
                                            </Box>
                                            <Box sx={{
                                                fontSize: '1.5rem',
                                                opacity: designRequest.uniformTypes.physicalEducation.genders.boy ? 1 : 0.3,
                                                pointerEvents: 'none'
                                            }}>
                                                🏃‍
                                            </Box>
                                        </Box>
                                        {designRequest.uniformTypes.physicalEducation.genders.boy && (
                                            <Button
                                                variant="contained"
                                                size="small"
                                                onClick={() => setDesignRequest(prev => ({
                                                    ...prev,
                                                    uniformTypes: {
                                                        ...prev.uniformTypes,
                                                        physicalEducation: {
                                                            ...prev.uniformTypes.physicalEducation,
                                                            details: {
                                                                ...prev.uniformTypes.physicalEducation.details,
                                                                boy: {
                                                                    ...prev.uniformTypes.physicalEducation.details.boy,
                                                                    showForm: true
                                                                }
                                                            }
                                                        }
                                                    }
                                                }))}
                                                sx={{
                                                    ml: 2,
                                                    backgroundColor: '#1976d2',
                                                    '&:hover': {
                                                        backgroundColor: '#1565c0'
                                                    }
                                                }}
                                            >
                                                Configure Details
                                            </Button>
                                        )}
                                    </Box>

                                    <Box sx={{
                                        p: 3,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        backgroundColor: designRequest.uniformTypes.physicalEducation.genders.girl ? '#fff3e0' : '#fff',
                                        transition: 'all 0.2s ease'
                                    }}>
                                        <Box
                                            onClick={() => handleGenderChange("physicalEducation", "girl")}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 2,
                                                cursor: 'pointer',
                                                flex: 1
                                            }}
                                        >
                                            <Checkbox
                                                checked={designRequest.uniformTypes.physicalEducation.genders.girl}
                                                name="physical-girl"
                                                color="primary"
                                                sx={{
                                                    p: 0,
                                                    pointerEvents: 'none'
                                                }}
                                            />
                                            <Box sx={{flex: 1, pointerEvents: 'none'}}>
                                                <Typography variant="body1" sx={{fontWeight: '600', mb: 0.5}}>
                                                    Girl
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Physical education uniform for female students
                                                </Typography>
                                                {designRequest.uniformTypes.physicalEducation.genders.girl && (
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            color: isGirlInfoComplete('physicalEducation') ? '#2e7d32' : '#d32f2f',
                                                            fontWeight: '600',
                                                            fontSize: '0.75rem',
                                                            mt: 0.5,
                                                            display: 'block'
                                                        }}
                                                    >
                                                        {isGirlInfoComplete('physicalEducation') ? 'All information filled' : 'Information missing'}
                                                    </Typography>
                                                )}
                                            </Box>
                                            <Box sx={{
                                                fontSize: '1.5rem',
                                                opacity: designRequest.uniformTypes.physicalEducation.genders.girl ? 1 : 0.3,
                                                pointerEvents: 'none'
                                            }}>
                                                🏃
                                            </Box>
                                        </Box>
                                        {designRequest.uniformTypes.physicalEducation.genders.girl && (
                                            <Button
                                                variant="contained"
                                                size="small"
                                                onClick={() => setDesignRequest(prev => ({
                                                    ...prev,
                                                    uniformTypes: {
                                                        ...prev.uniformTypes,
                                                        physicalEducation: {
                                                            ...prev.uniformTypes.physicalEducation,
                                                            details: {
                                                                ...prev.uniformTypes.physicalEducation.details,
                                                                girl: {
                                                                    ...prev.uniformTypes.physicalEducation.details.girl,
                                                                    showForm: true
                                                                }
                                                            }
                                                        }
                                                    }
                                                }))}
                                                sx={{
                                                    ml: 2,
                                                    backgroundColor: '#1976d2',
                                                    '&:hover': {
                                                        backgroundColor: '#1565c0'
                                                    }
                                                }}
                                            >
                                                Configure Details
                                            </Button>
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                            <Dialog open={designRequest.uniformTypes.physicalEducation.details.boy.showForm}
                                    onClose={() => setDesignRequest(prev => ({
                                        ...prev,
                                        uniformTypes: {
                                            ...prev.uniformTypes,
                                            physicalEducation: {
                                                ...prev.uniformTypes.physicalEducation,
                                                details: {
                                                    ...prev.uniformTypes.physicalEducation.details,
                                                    boy: {
                                                        ...prev.uniformTypes.physicalEducation.details.boy,
                                                        showForm: false
                                                    }
                                                }
                                            }
                                        }
                                    }))} maxWidth="md" fullWidth>
                                <DialogTitle>Physical Education Uniform Details (Boy)</DialogTitle>
                                <DialogContent>
                                    {renderBoyUniformDetails("physicalEducation")}
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={() => setDesignRequest(prev => ({
                                        ...prev,
                                        uniformTypes: {
                                            ...prev.uniformTypes,
                                            physicalEducation: {
                                                ...prev.uniformTypes.physicalEducation,
                                                details: {
                                                    ...prev.uniformTypes.physicalEducation.details,
                                                    boy: {
                                                        ...prev.uniformTypes.physicalEducation.details.boy,
                                                        showForm: false
                                                    }
                                                }
                                            }
                                        }
                                    }))}>Close</Button>
                                </DialogActions>
                            </Dialog>
                            <Dialog open={designRequest.uniformTypes.physicalEducation.details.girl.showForm}
                                    onClose={() => setDesignRequest(prev => ({
                                        ...prev,
                                        uniformTypes: {
                                            ...prev.uniformTypes,
                                            physicalEducation: {
                                                ...prev.uniformTypes.physicalEducation,
                                                details: {
                                                    ...prev.uniformTypes.physicalEducation.details,
                                                    girl: {
                                                        ...prev.uniformTypes.physicalEducation.details.girl,
                                                        showForm: false
                                                    }
                                                }
                                            }
                                        }
                                    }))} maxWidth="md" fullWidth>
                                <DialogTitle>Physical Education Uniform Details (Girl)</DialogTitle>
                                <DialogContent>
                                    {renderGirlUniformDetails("physicalEducation")}
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={() => setDesignRequest(prev => ({
                                        ...prev,
                                        uniformTypes: {
                                            ...prev.uniformTypes,
                                            physicalEducation: {
                                                ...prev.uniformTypes.physicalEducation,
                                                details: {
                                                    ...prev.uniformTypes.physicalEducation.details,
                                                    girl: {
                                                        ...prev.uniformTypes.physicalEducation.details.girl,
                                                        showForm: false
                                                    }
                                                }
                                            }
                                        }
                                    }))}>Close</Button>
                                </DialogActions>
                            </Dialog>
                        </>
                    )}
                </Box>
            </Box>

            <Box sx={{
                mt: 4,
                pt: 3,
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                gap: 2
            }}>
                <Button
                    onClick={() => window.location.href = '/school/design'}
                    variant="outlined"
                    size="large"
                    sx={{
                        borderColor: '#cbd5e1',
                        color: '#64748b',
                        '&:hover': {
                            borderColor: '#2e7d32',
                            color: '#2e7d32',
                            backgroundColor: 'rgba(46, 125, 50, 0.04)'
                        }
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    size="large"
                    disabled={isSubmitting}
                        startIcon={isSubmitting ? <InlineLoading size={20} color="inherit"/> : null}
                    sx={{
                        background: "linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)",
                        color: "white",
                        px: 4,
                        py: 1.5,
                        fontSize: "1rem",
                        fontWeight: 600,
                        borderRadius: 2,
                        textTransform: "none",
                        boxShadow: "0 4px 15px rgba(46, 125, 50, 0.3)",
                        "&:hover": {
                            background: "linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)",
                            transform: "translateY(-2px)",
                            boxShadow: "0 8px 25px rgba(46, 125, 50, 0.4)"
                        },
                        "&:disabled": {
                            background: "#cbd5e1",
                            transform: "none",
                            boxShadow: "none"
                        }
                    }}
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </Button>
            </Box>
        </Box>
    );
}