export const designerFindingWithin = 5

export const designerMaxQuotation = 5

export const vietnamProvinces = [
    {
        id: '01', name: 'Hà Nội', districts: [
            {id: '001', name: 'Ba Đình'},
            {id: '002', name: 'Hoàn Kiếm'},
            {id: '003', name: 'Hai Bà Trưng'},
            {id: '004', name: 'Đống Đa'},
            {id: '005', name: 'Tây H�?},
            {id: '006', name: 'Cầu Giấy'},
            {id: '007', name: 'Thanh Xuân'},
            {id: '008', name: 'Hoàng Mai'},
            {id: '009', name: 'Long Biên'},
            {id: '010', name: 'Nam T�?Liêm'},
            {id: '011', name: 'Bắc T�?Liêm'},
            {id: '012', name: 'Hà Đông'},
            {id: '013', name: 'Sơn Tây'},
            {id: '014', name: 'Ba Vì'},
            {id: '015', name: 'Phúc Th�?},
            {id: '016', name: 'Đan Phượng'},
            {id: '017', name: 'Hoài Đức'},
            {id: '018', name: 'Quốc Oai'},
            {id: '019', name: 'Thạch Thất'},
            {id: '020', name: 'Chương M�?},
            {id: '021', name: 'Thanh Oai'},
            {id: '022', name: 'Thường Tín'},
            {id: '023', name: 'Phú Xuyên'},
            {id: '024', name: 'Ứng Hòa'},
            {id: '025', name: 'M�?Đức'}
        ]
    },
    {
        id: '02', name: 'TP. H�?Chí Minh', districts: [
            {id: '026', name: 'District 1'},
            {id: '027', name: 'District 2'},
            {id: '028', name: 'District 3'},
            {id: '029', name: 'District 4'},
            {id: '030', name: 'District 5'},
            {id: '031', name: 'District 6'},
            {id: '032', name: 'District 7'},
            {id: '033', name: 'District 8'},
            {id: '034', name: 'District 9'},
            {id: '035', name: 'District 10'},
            {id: '036', name: 'District 11'},
            {id: '037', name: 'District 12'},
            {id: '038', name: 'Tân Bình'},
            {id: '039', name: 'Tân Phú'},
            {id: '040', name: 'Phú Nhuận'},
            {id: '041', name: 'Gò Vấp'},
            {id: '042', name: 'Bình Thạnh'},
            {id: '043', name: 'Th�?Đức'},
            {id: '044', name: 'C�?Chi'},
            {id: '045', name: 'Hóc Môn'},
            {id: '046', name: 'Bình Chánh'},
            {id: '047', name: 'Nhà Bè'},
            {id: '048', name: 'Cần Gi�?}
        ]
    },
    {
        id: '03', name: 'Đà Nẵng', districts: [
            {id: '049', name: 'Hải Châu'},
            {id: '050', name: 'Thanh Khê'},
            {id: '051', name: 'Sơn Trà'},
            {id: '052', name: 'Ngũ Hành Sơn'},
            {id: '053', name: 'Liên Chiểu'},
            {id: '054', name: 'Cẩm L�?},
            {id: '055', name: 'Hòa Vang'},
            {id: '056', name: 'Hoàng Sa'}
        ]
    },
    {
        id: '04', name: 'Cần Thơ', districts: [
            {id: '057', name: 'Ninh Kiều'},
            {id: '058', name: 'Ô Môn'},
            {id: '059', name: 'Bình Thủy'},
            {id: '060', name: 'Cái Răng'},
            {id: '061', name: 'Thốt Nốt'},
            {id: '062', name: 'Vĩnh Thạnh'},
            {id: '063', name: 'C�?Đ�?},
            {id: '064', name: 'Phong Điền'},
            {id: '065', name: 'Thới Lai'}
        ]
    },
    {
        id: '05', name: 'Hải Phòng', districts: [
            {id: '066', name: 'Hồng Bàng'},
            {id: '067', name: 'Ngô Quyền'},
            {id: '068', name: 'Lê Chân'},
            {id: '069', name: 'Hải An'},
            {id: '070', name: 'Kiến An'},
            {id: '071', name: 'Đ�?Sơn'},
            {id: '072', name: 'Dương Kinh'},
            {id: '073', name: 'Thủy Nguyên'},
            {id: '074', name: 'An Dương'},
            {id: '075', name: 'An Lão'},
            {id: '076', name: 'Kiến Thụy'},
            {id: '077', name: 'Tiên Lãng'},
            {id: '078', name: 'Vĩnh Bảo'},
            {id: '079', name: 'Cát Hải'},
            {id: '080', name: 'Bạch Long Vĩ'}
        ]
    }
];

export const serviceFee = (amount) => {
    if (amount <= 10000000) {
        return 0.02 * amount
    }else{
        return 200000;
    }
}