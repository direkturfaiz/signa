# Barberin Seamless Service

# BARBERIN — CUSTOMER MOBILE WEB APPLICATION

## FINAL PROJECT PROMPT — SIMPLIFIED CUSTOMER FLOW

Buat sebuah aplikasi web baru (NEW PROJECT) bernama **BARBERIN** dari awal.

Aplikasi ini adalah aplikasi **customer-facing mobile web** untuk sistem manajemen barbershop.

Fokus project ini adalah membuat pengalaman customer yang sederhana dari memilih layanan sampai transaksi selesai dan struk tersedia.

Gunakan seluruh gambar/reference yang diberikan sebagai referensi visual, terutama:

- Customer Wireframe

- Customer BPMN / Business Process

- BARBERIN Branding Kit

- BARBERIN Logo

Jangan membuat project ini sebagai kelanjutan dari project lain.

Bangun sebagai **NEW PROJECT dari zero**.

==================================================

1. PRODUCT IDENTITY

==================================================

Product Name:

BARBERIN

Tagline:

Modern Barbershop Management System

Target User:

Customer barbershop.

Tujuan aplikasi:

Customer dapat:

- melihat daftar layanan

- memilih satu atau beberapa layanan

- memasukkan layanan ke keranjang

- memasukkan nama pelanggan

- mendapatkan ID pelanggan otomatis

- memilih metode pembayaran

- melihat total pembayaran

- melihat status pengerjaan layanan

- menunggu konfirmasi pembayaran

- melihat transaksi berhasil

- melihat struk transaksi

- mengunduh struk PDF

- membagikan struk

- menyelesaikan transaksi

==================================================

2. AKSES APLIKASI CUSTOMER

==================================================

Untuk tahap awal, JANGAN menggunakan QR Code atau Barcode.

Customer mengakses aplikasi secara manual melalui browser Chrome pada smartphone.

Flow akses:

Customer membuka Chrome

↓

Customer mengetik URL BARBERIN secara manual

↓

Browser membuka BARBERIN

↓

Customer langsung masuk ke halaman "Pilih Layanan"

Customer route:

/customer/services

Route `/customer/services` harus menjadi entry point utama customer.

PENTING:

- Jangan membuat QR Code.

- Jangan membuat Barcode.

- Jangan membuat QR Scanner.

- Jangan membuat Barcode Scanner.

- Jangan menggunakan kamera smartphone.

- Jangan membuat halaman "Scan Barcode".

- Jangan membuat tombol "Scan QR".

- Jangan meminta permission kamera.

Customer harus langsung masuk ke halaman katalog layanan setelah membuka URL.

==================================================

3. CUSTOMER BUSINESS FLOW

==================================================

Implementasikan flow customer berikut:

Chrome Smartphone

↓

Manual Input URL

↓

Pilih Layanan

↓

Keranjang Layanan

↓

Informasi Pelanggan

↓

ID Pelanggan Otomatis

↓

Metode Pembayaran

↓

Total Pembayaran

↓

Eksekusi Layanan

↓

Menunggu Konfirmasi Pembayaran

↓

Transaksi Berhasil

↓

Struk Transaksi

↓

Download / Share Struk

↓

Selesai

Jangan menambahkan pilihan model rambut.

Jangan membuat katalog model/variant.

Customer hanya memilih layanan.

==================================================

4. MOBILE-FIRST DESIGN

==================================================

Aplikasi harus dirancang khusus untuk smartphone.

Target viewport:

360px

375px

390px

414px

430px

Gunakan mobile-first layout.

Karakteristik:

- single column

- touch friendly

- tombol mudah ditekan

- spacing nyaman

- sticky bottom CTA jika diperlukan

- safe-area smartphone

- readable typography

- clean interface

Desktop hanya digunakan untuk preview/testing.

Jangan membuat aplikasi menjadi desktop dashboard.

Jangan membuat:

- sidebar desktop

- tabel desktop

- dashboard admin

- layout multi-column kompleks

==================================================

5. BRAND IDENTITY

==================================================

Nama aplikasi:

BARBERIN

Tagline:

Modern Barbershop Management System

Gunakan logo BARBERIN yang diberikan sebagai asset utama.

PENTING:

- Gunakan logo yang diberikan.

- Jangan mengganti logo dengan logo generik.

- Jangan membuat ulang logo menggunakan icon biasa.

- Jangan menggunakan emoji sebagai pengganti logo.

Gunakan BARBERIN Branding Kit sebagai referensi utama.

==================================================

6. COLOR PALETTE

==================================================

Gunakan warna berikut:

Primary Soft Blue:

#7AA7FF

Primary Blue:

#4E78FF

Deep Blue:

#1B284D

Navy:

#0D1526

Slate:

#172133

White:

#FFFFFF

Gray 50:

#F6F8FC

Gray 100:

#E7ECF3

Gray 200:

#D1D8E6

Gray 700:

#33415C

Success:

#22C55E

Warning:

#F59E0B

Danger:

#EF4444

Info:

#38BDF8

Gunakan warna biru sebagai visual identity utama.

==================================================

7. TYPOGRAPHY

==================================================

Gunakan:

Font:

Inter

Hierarchy:

- Large heading: bold

- Section heading: semibold

- Body: regular

- Supporting text: regular

- Button: semibold

Pastikan typography memiliki readability tinggi.

==================================================

8. VISUAL DESIGN

==================================================

Style:

- modern

- clean

- professional

- premium

- minimal

- mobile-first

- subtle Liquid Glass

- soft blue glow

- rounded cards

- thin borders

- soft shadows

- strong readability

Gunakan Liquid Glass secara subtle.

Jangan membuat seluruh halaman terlalu transparan.

Prinsip utama:

"Glass is secondary, readability is primary."

==================================================

9. BORDER RADIUS

==================================================

Button:

12px

Input:

12px

Small Card:

14px

Standard Card:

18px

Large Card:

20px

Modal:

24px

==================================================

10. SPACING SYSTEM

==================================================

Gunakan spacing:

4px

8px

12px

16px

20px

24px

32px

40px

48px

64px

Jangan menggunakan spacing secara acak.

==================================================

11. ICONOGRAPHY

==================================================

Gunakan Lucide Icons.

Style:

- outline

- 2px stroke

- rounded

- simple

- consistent

Jangan menggunakan emoji sebagai primary UI icon.

==================================================

12. CUSTOMER ROUTES

==================================================

Buat route berikut:

/customer/services

/customer/cart

/customer/customer-info

/customer/payment

/customer/service-execution

/customer/payment-confirmation

/customer/success

/customer/receipt/:transactionId

/customer/completed

HANYA gunakan route yang diperlukan untuk flow customer di atas.

JANGAN membuat:

/customer/history

/customer/history/:transactionId

karena fitur riwayat transaksi belum diperlukan pada tahap ini.

==================================================

13. HALAMAN PILIH LAYANAN

==================================================

Route:

/customer/services

Judul:

"Pilih Layanan"

Tujuan:

Customer dapat melihat seluruh layanan barbershop yang tersedia dan memilih layanan yang diinginkan.

Customer dapat memilih satu atau beberapa layanan.

Setiap service card minimal memiliki:

- nama layanan

- deskripsi singkat

- harga

- tombol tambah

- selected state

Contoh layanan:

Haircut / Potong Rambut

Rp 30.000

Hair Wash / Keramas

Rp 20.000

Shaving / Cukur Kumis & Jenggot

Rp 15.000

Customer cukup memilih layanan.

PENTING:

Tidak ada pilihan model rambut.

Tidak ada variant.

Tidak ada katalog model.

Tidak ada halaman pemilihan model.

Tidak ada pilihan:

- Two Block

- French Crop

- Undercut

- Classic Cut

- Fade

Semua layanan langsung dipilih berdasarkan nama layanan dan harga.

CTA utama:

"Lanjut ke Keranjang"

==================================================

14. KERANJANG LAYANAN

==================================================

Route:

/customer/cart

Judul:

"Keranjang"

Tampilkan:

- daftar layanan

- harga

- quantity

- subtotal

Customer dapat:

- menambah quantity

- mengurangi quantity

- menghapus layanan

Gunakan component:

CartItem

QuantityControl

PriceSummary

Contoh:

Haircut / Potong Rambut

1x

Rp 30.000

Hair Wash / Keramas

1x

Rp 20.000

Shaving / Cukur Kumis & Jenggot

1x

Rp 15.000

Total:

Rp 65.000

CTA:

"Lanjutkan"

Jika cart kosong:

"Keranjang masih kosong."

==================================================

15. INFORMASI PELANGGAN

==================================================

Route:

/customer/customer-info

Judul:

"Informasi Pelanggan"

Customer memasukkan:

Nama Lengkap

Contoh:

Andi Pratama

Validasi:

- wajib diisi

- tidak boleh kosong

- tampilkan error yang jelas jika invalid

CTA:

"Lanjutkan"

==================================================

16. ID PELANGGAN OTOMATIS

==================================================

Setelah nama customer valid, sistem otomatis membuat atau mengambil Customer ID.

Customer tidak perlu memasukkan ID secara manual.

Contoh:

Nama:

Andi Pratama

Customer ID:

PLG2509120001

ID digunakan untuk:

- transaksi

- struk

Gunakan state:

customerName

customerId

==================================================

17. METODE PEMBAYARAN

==================================================

Route:

/customer/payment

Judul:

"Metode Pembayaran"

Customer memilih salah satu metode pembayaran yang tersedia.

Contoh:

- Tunai

- QRIS

- Transfer

Gunakan:

PaymentMethodCard

Setiap payment card memiliki:

- icon

- nama metode

- deskripsi singkat

- selected state

Customer hanya dapat memilih satu metode pembayaran.

Tampilkan:

Total Pembayaran

Rp 65.000

CTA:

"Konfirmasi Pembayaran"

==================================================

18. TOTAL PEMBAYARAN

==================================================

Total harus dihitung otomatis berdasarkan item dalam cart.

Formula:

Subtotal layanan

+

Biaya tambahan jika ada

=

Total pembayaran

Format:

Rp 30.000

Rp 65.000

Rp 100.000

Jangan menggunakan:

30000 IDR

Gunakan format Rupiah Indonesia.

==================================================

19. STATUS EKSEKUSI LAYANAN

==================================================

Route:

/customer/service-execution

Setelah transaksi/order dibuat, customer melihat status pengerjaan layanan.

Judul:

"Layanan Sedang Diproses"

Tampilkan:

- layanan yang dipilih

- capster jika tersedia

- status pengerjaan

- progress/status indicator

Contoh status:

"Menunggu layanan dimulai"

"Sedang dikerjakan"

"Layanan hampir selesai"

"Sedang diselesaikan"

Status tidak boleh hanya dibedakan menggunakan warna.

Gunakan text/status badge/icon.

Component:

ServiceExecutionStatus

==================================================

20. MENUNGGU KONFIRMASI PEMBAYARAN

==================================================

Route:

/customer/payment-confirmation

Judul:

"Menunggu Konfirmasi Pembayaran"

Customer melihat bahwa pembayaran masih menunggu konfirmasi dari capster/barbershop.

Tampilkan:

Status:

"Menunggu konfirmasi"

Pesan:

"Pembayaran Anda sedang menunggu konfirmasi."

Jika prototype/demo, sediakan mekanisme simulasi:

"Simulasikan Konfirmasi Pembayaran"

Setelah dikonfirmasi:

transactionStatus:

SUCCESS

==================================================

21. TRANSAKSI BERHASIL

==================================================

Route:

/customer/success

Tampilkan success state.

Judul:

"Transaksi Berhasil"

Pesan:

"Transaksi Anda telah berhasil."

Tampilkan:

- Transaction ID

- Customer ID

- Nama

- Total

- Payment method

CTA:

"Lihat Struk"

Secondary CTA:

"Selesai"

==================================================

22. STRUK TRANSAKSI

==================================================

Route:

/customer/receipt/:transactionId

Buat receipt card yang clean dan profesional.

Isi struk:

BARBERIN

Transaction ID:

TRX2509120001

Customer ID:

PLG2509120001

Nama:

Andi Pratama

Tanggal:

12 September 2025

Waktu:

09:45

Layanan:

Haircut / Potong Rambut

Rp 30.000

Hair Wash / Keramas

Rp 20.000

Shaving / Cukur Kumis & Jenggot

Rp 15.000

Total:

Rp 65.000

Metode Pembayaran:

Tunai

Status:

Berhasil

Tambahkan CTA:

"Unduh PDF"

"Bagikan Struk"

"Selesai"

==================================================

23. DOWNLOAD STRUK PDF

==================================================

Customer dapat mengunduh struk dalam format PDF.

Nama file:

BARBERIN-TRX2509120001.pdf

PDF harus memiliki informasi transaksi yang sama dengan receipt.

Loading state:

"Menyiapkan struk..."

Jika berhasil:

"Struk berhasil dibuat."

Jika gagal:

"Gagal membuat PDF. Silakan coba lagi."

==================================================

24. BAGIKAN STRUK

==================================================

Tambahkan fitur:

"Bagikan Struk"

Gunakan Web Share API jika browser mendukung.

Jika tidak tersedia:

gunakan fallback yang sesuai, misalnya copy link atau informasi transaksi.

Tampilkan feedback:

"Struk siap dibagikan."

==================================================

25. SELESAI

==================================================

Route:

/customer/completed

Tampilkan final state.

Judul:

"Selesai"

Pesan:

"Terima kasih telah menggunakan BARBERIN."

CTA:

"Kembali ke Home"

Jika kembali ke home:

/customer/services

==================================================

26. CUSTOMER NAVIGATION

==================================================

Jangan menggunakan sidebar.

Tidak perlu membuat bottom navigation untuk Riwayat karena fitur riwayat belum digunakan.

Selama transaksi berlangsung, gunakan:

Back button

di bagian atas untuk kembali ke step sebelumnya jika memungkinkan.

Navigasi harus sederhana dan tidak mengganggu transaction flow.

==================================================

27. STATE MANAGEMENT

==================================================

Gunakan struktur state yang jelas dan mudah dikembangkan ke backend pada tahap berikutnya.

State utama:

selectedServices

cartItems

customerName

customerId

paymentMethod

transactionId

transactionStatus

serviceExecutionStatus

paymentConfirmationStatus

receiptData

JANGAN membuat state:

serviceVariants

karena tidak ada pilihan model/variant.

Untuk prototype, gunakan mock/local state.

Namun struktur kode harus mudah dihubungkan ke backend/database pada tahap berikutnya.

==================================================

28. MOCK DATA

==================================================

Gunakan mock data untuk demo.

Customer:

Name:

Andi Pratama

Customer ID:

PLG2509120001

Transaction ID:

TRX2509120001

Services:

Haircut / Potong Rambut

Rp 30.000

Hair Wash / Keramas

Rp 20.000

Shaving / Cukur Kumis & Jenggot

Rp 15.000

Total:

Rp 65.000

Payment:

Tunai

Status:

Berhasil

==================================================

29. DEMO FLOW

==================================================

Pastikan prototype dapat diuji end-to-end.

Demo:

1. Buka `/customer/services`

2. Pilih Haircut / Potong Rambut

3. Pilih Hair Wash / Keramas

4. Pilih Shaving / Cukur Kumis & Jenggot

5. Buka keranjang

6. Periksa total Rp 65.000

7. Masukkan nama Andi Pratama

8. Sistem membuat Customer ID otomatis

9. Pilih pembayaran Tunai

10. Konfirmasi transaksi

11. Masuk ke status eksekusi layanan

12. Masuk ke waiting confirmation

13. Simulasikan konfirmasi pembayaran

14. Tampilkan transaksi berhasil

15. Buka struk

16. Download PDF

17. Bagikan struk

18. Selesai

Semua flow harus dapat berjalan tanpa backend penuh untuk kebutuhan prototype.

==================================================

30. LOADING STATES

==================================================

Buat loading state untuk:

- loading services

- creating customer ID

- processing transaction

- loading transaction

- generating PDF

- sharing receipt

Gunakan skeleton/loading indicator yang clean.

==================================================

31. ERROR STATES

==================================================

Buat error state untuk:

- general application error

- network error

- empty cart

- invalid customer name

- payment method belum dipilih

- transaction error

- PDF generation error

- share error

Contoh:

"Nama pelanggan wajib diisi."

"Silakan pilih metode pembayaran."

"Terjadi kesalahan saat memproses transaksi."

"Silakan coba lagi."

==================================================

32. EMPTY STATES

==================================================

Buat empty state untuk:

Cart:

"Keranjang masih kosong."

Gunakan icon Lucide dan CTA yang relevan.

Tidak perlu membuat empty state untuk history karena fitur history belum dibuat.

==================================================

33. ACCESSIBILITY

==================================================

Pastikan:

- touch target minimal sekitar 44px

- text mudah dibaca

- contrast cukup

- button memiliki label jelas

- input memiliki label

- status tidak hanya menggunakan warna

- focus state tersedia

- interactive element mudah digunakan di smartphone

==================================================

34. REUSABLE COMPONENTS

==================================================

Buat reusable components:

CustomerHeader

BackButton

ServiceCard

CartItem

QuantityControl

PriceSummary

PrimaryButton

SecondaryButton

GlassCard

StatusBadge

PaymentMethodCard

TransactionSummary

ReceiptCard

EmptyState

LoadingState

ErrorState

SuccessState

BottomActionBar

ServiceExecutionStatus

PaymentConfirmationStatus

JANGAN membuat:

ServiceVariantCard

karena tidak ada pemilihan model/variant.

==================================================

35. UX PRINCIPLES

==================================================

Prioritaskan:

1. Simplicity

2. Clarity

3. Speed

4. Mobile usability

5. Visual hierarchy

6. Minimal cognitive load

Customer harus selalu mengetahui:

- sedang berada di step apa

- apa yang harus dilakukan

- berapa total pembayaran

- status layanan

- status pembayaran

- apa yang terjadi setelah tombol ditekan

Jangan membuat flow yang membingungkan.

Jangan menambahkan fitur yang belum diperlukan.

==================================================

36. FORMAT HARGA

==================================================

Gunakan format Indonesia:

Rp 30.000

Rp 65.000

Rp 100.000

Gunakan thousand separator ".".

==================================================

37. FORMAT TANGGAL

==================================================

Gunakan format:

12 September 2025 • 09:45

atau:

12 Mei 2025 • 09:45

Gunakan bahasa Indonesia.

==================================================

38. BUSINESS RULES

==================================================

1. Satu transaksi dapat memiliki banyak layanan.

2. Setiap layanan dapat memiliki quantity.

3. Customer hanya memilih layanan.

4. Tidak ada pemilihan model rambut.

5. Tidak ada variant layanan.

6. Tidak ada katalog model.

7. Customer tidak memasukkan Customer ID secara manual.

8. Customer ID dibuat otomatis oleh sistem.

9. Total dihitung berdasarkan isi keranjang.

10. Customer memilih satu metode pembayaran.

11. Setelah order dibuat, layanan masuk ke status eksekusi.

12. Setelah proses layanan/payment sesuai flow, transaksi masuk ke waiting confirmation.

13. Capster/barbershop mengonfirmasi pembayaran.

14. Setelah pembayaran dikonfirmasi, transaksi menjadi berhasil.

15. Setelah berhasil, receipt tersedia.

16. Receipt dapat di-download sebagai PDF.

17. Receipt dapat dibagikan.

18. Setelah transaksi selesai, customer dapat kembali ke halaman awal.

19. Riwayat transaksi BELUM dibuat pada tahap ini.

==================================================

39. DESIGN CONSISTENCY

==================================================

Semua halaman harus terlihat sebagai satu produk yang sama.

Pastikan konsisten dalam:

- typography

- color

- spacing

- card

- border

- button

- icon

- status

- navigation

- animation

Gunakan animation secara subtle.

Contoh:

- page transition

- button feedback

- card selection

- loading

- success animation

Jangan menggunakan animasi berlebihan.

==================================================

40. JANGAN MEMBUAT

==================================================

JANGAN membuat:

- QR scanner

- Barcode scanner

- kamera scanning

- QR Code page

- halaman "Scan Barcode"

- tombol "Scan QR"

- camera permission

JANGAN membuat:

- pilihan model rambut

- katalog model rambut

- variant layanan

- halaman pemilihan model

- Two Block

- French Crop

- Undercut

- Classic Cut

- Fade

JANGAN membuat:

- riwayat transaksi

- detail riwayat transaksi

- menu Riwayat

- halaman `/customer/history`

- halaman `/customer/history/:transactionId`

JANGAN membuat:

- desktop admin dashboard

- sidebar desktop

- fitur admin

- fitur capster dashboard

- fitur owner dashboard

- inventory

- payroll

- laporan bisnis

Fokus project ini HANYA pada:

CUSTOMER MOBILE WEB EXPERIENCE.

==================================================

41. FINAL ACCEPTANCE CRITERIA

==================================================

Project dianggap berhasil jika:

✓ Project dibuat sebagai NEW PROJECT dari awal.

✓ Fokus utama adalah customer-facing mobile web application.

✓ Customer dapat membuka aplikasi menggunakan URL secara manual melalui Chrome smartphone.

✓ `/customer/services` menjadi entry point utama customer.

✓ Customer langsung melihat halaman "Pilih Layanan".

✓ Tidak terdapat QR Code Scanner.

✓ Tidak terdapat Barcode Scanner.

✓ Tidak terdapat akses kamera.

✓ Customer dapat memilih satu atau beberapa layanan.

✓ Customer TIDAK perlu memilih model rambut.

✓ Tidak terdapat katalog model rambut.

✓ Tidak terdapat variant layanan.

✓ Customer dapat memasukkan layanan ke keranjang.

✓ Customer dapat mengubah quantity.

✓ Customer dapat menghapus layanan.

✓ Customer dapat memasukkan nama pelanggan.

✓ Sistem menghasilkan Customer ID otomatis.

✓ Customer dapat memilih metode pembayaran.

✓ Total pembayaran dihitung otomatis.

✓ Customer dapat melihat status eksekusi layanan.

✓ Customer dapat melihat status menunggu konfirmasi pembayaran.

✓ Customer dapat melihat transaksi berhasil.

✓ Customer dapat melihat struk transaksi.

✓ Customer dapat mengunduh struk dalam PDF.

✓ Customer dapat membagikan struk.

✓ Customer dapat menyelesaikan transaksi.

✓ Customer dapat kembali ke halaman awal setelah transaksi selesai.

✓ Tidak terdapat fitur riwayat transaksi.

✓ Tidak terdapat menu riwayat.

✓ Seluruh interface menggunakan bahasa Indonesia.

✓ UI mobile-first dengan target 360–430px portrait.

✓ Branding BARBERIN digunakan secara konsisten.

✓ Logo BARBERIN menggunakan asset yang diberikan.

✓ Typography menggunakan Inter.

✓ Color palette mengikuti BARBERIN Branding Kit.

✓ UI menggunakan modern, clean, premium, minimal aesthetic.

✓ Liquid Glass digunakan secara subtle.

✓ Tidak ada desktop dashboard.

✓ Tidak ada sidebar.

✓ Tidak ada QR/Barcode functionality.

✓ Tidak ada pilihan model rambut.

✓ Tidak ada riwayat transaksi.

==================================================

42. FINAL IMPLEMENTATION INSTRUCTION

==================================================

Build this application now as a NEW BARBERIN CUSTOMER MOBILE WEB PROJECT from scratch.

Gunakan uploaded visual references sebagai acuan utama untuk visual design dan customer flow.

Prioritaskan:

- customer experience

- mobile usability

- clean UI

- BARBERIN branding

- simple service selection

- transaction flow

- receipt

Untuk tahap ini:

1. Customer membuka Chrome.

2. Customer mengetik URL BARBERIN secara manual.

3. Customer langsung masuk ke halaman Pilih Layanan.

4. Customer hanya memilih layanan.

5. Tidak ada pilihan model rambut.

6. Tidak ada QR Code.

7. Tidak ada Barcode.

8. Tidak ada kamera.

9. Tidak ada riwayat transaksi.

Final flow:

Chrome

↓

Manual URL

↓

BARBERIN

↓

Pilih Layanan

↓

Keranjang

↓

Informasi Pelanggan

↓

ID Pelanggan Otomatis

↓

Metode Pembayaran

↓

Total Pembayaran

↓

Eksekusi Layanan

↓

Menunggu Konfirmasi Pembayaran

↓

Transaksi Berhasil

↓

Struk

↓

Download / Share

↓

Selesai

Build the complete customer mobile web experience according to all requirements above.

Do not add features outside this scope.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://barberin-smooth-flow.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d0186c85-332e-4103-8139-fadbf69d7c21).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
