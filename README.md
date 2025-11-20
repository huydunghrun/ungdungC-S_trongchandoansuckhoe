
<h2 align="center">
    <a href="https://dainam.edu.vn/vi/khoa-cong-nghe-thong-tin">
    🎓 Faculty of Information Technology (DaiNam University)
    </a>
</h2>

<h2 align="center">
    ỨNG DỤNG CHUYỂN ĐỔI SỐ TRONG HỖ TRỢ CHẨN ĐOÁN SỨC KHỎE TÂM LÍ
</h2>

<div align="center">
    <p align="center">
        <img alt="AIoTLab Logo" width="170" src="docs/aiotlab_logo.png" />
        <img alt="DaiNam University Logo" width="200" src="docs/fitdnu_logo.png" />
        <img alt="CNTT Logo" width="180" src="docs/dnu_logo.png" />
    </p>

[![AIoTLab](https://img.shields.io/badge/AIoTLab-green?style=for-the-badge)](https://www.facebook.com/DNUAIoTLab)
[![Faculty of Information Technology](https://img.shields.io/badge/Faculty%20of%20Information%20Technology-blue?style=for-the-badge)](https://dainam.edu.vn/vi/khoa-cong-nghe-thong-tin)
[![DaiNam University](https://img.shields.io/badge/DaiNam%20University-orange?style=for-the-badge)](https://dainam.edu.vn)
</div>


Dự án ứng dụng Android được phát triển cho môn học **Chuyển đổi số**. 
Ứng dụng này là một công cụ giúp số hóa quy trình tự đánh giá và theo dõi sức khỏe tâm lý, dựa trên thang đo **PHQ-9 (Patient Health Questionnaire-9)** đã được khoa học công nhận.

---

## 🧩 CHƯƠNG 1: GIỚI THIỆU HỆ THỐNG

### 1.1. Bối cảnh
Trong bối cảnh chuyển đổi số đang diễn ra mạnh mẽ trong lĩnh vực y tế (Digital Health), việc tiếp cận các công cụ chăm sóc sức khỏe tâm lý vẫn còn nhiều rào cản. Dự án này được xây dựng nhằm cung cấp một công cụ đơn giản, riêng tư và tiện lợi, cho phép người dùng tự kiểm tra và theo dõi các dấu hiệu tâm lý của bản thân ngay trên thiết bị di động.

### 1.2. Chức năng chính
Ứng dụng cung cấp một quy trình khép kín từ kiểm tra đến theo dõi kết quả:
* **Thực hiện bài kiểm tra:** Cung cấp 9 câu hỏi chuẩn hóa của thang đo PHQ-9.
* **Tính điểm & Phân loại:** Tự động tính tổng điểm sau khi hoàn tất và đưa ra 5 mức độ phân loại (Không, Nhẹ, Trung bình, Nặng, Rất nặng).
* **Lưu trữ lịch sử:** Tự động lưu kết quả (điểm số, mức độ, ngày giờ) vào cơ sở dữ liệu cục bộ trên máy.
* **Xem lịch sử:** Cung cấp màn hình danh sách, cho phép xem lại toàn bộ các lần kiểm tra trước đó.
* **Trực quan hóa xu hướng:** Sử dụng biểu đồ đường để trực quan hóa sự thay đổi điểm số theo thời gian, giúp người dùng dễ dàng theo dõi tiến trình.
* **Quản lý dữ liệu:** Cho phép người dùng xóa toàn bộ lịch sử dữ liệu để đảm bảo quyền riêng tư.

---

## 💻 CHƯƠNG 2: CÔNG NGHỆ SỬ DỤNG

### 2.1. Công nghệ cốt lõi
Dự án được xây dựng với 100% **Kotlin** và áp dụng các công nghệ hiện đại nhất trong hệ sinh thái Android Jetpack:

| Thành phần | Công nghệ | Mục đích sử dụng |
| :--- | :--- | :--- |
| **Ngôn ngữ** | Kotlin | Ngôn ngữ lập trình chính, hỗ trợ bất đồng bộ với Coroutines. |
| **Kiến trúc** | MVVM | (Model-View-ViewModel) Tách biệt logic, UI và dữ liệu. |
| **Giao diện (UI)** | Material Design 3 | Thiết kế giao diện hiện đại, tuân thủ chuẩn Google. |
| **Liên kết View** | View Binding | Thay thế `findViewById` một cách an toàn. |
| **Điều hướng** | Jetpack Navigation | Quản lý luồng di chuyển giữa các Fragment trong một Activity duy nhất. |
| **Lưu trữ CSDL** | Room Persistence Library | Lưu trữ cục bộ (SQLite) lịch sử bài kiểm tra. |
| **Quản lý trạng thái** | LiveData / StateFlow | Đồng bộ dữ liệu từ ViewModel tới UI một cách tự động. |
| **Biểu đồ** | MPAndroidChart | Vẽ biểu đồ đường để theo dõi xu hướng điểm số. |
| **DI** | Hilt | Quản lý và "tiêm" các phụ thuộc (như Repository, Database). |
| **Build** | Gradle Kotlin DSL | Quản lý thư viện và cấu hình build. |

### 2.2. Sơ đồ kiến trúc (MVVM)
Ứng dụng tuân thủ nghiêm ngặt kiến trúc MVVM, phân tách rõ ràng các lớp (layer):
![alt text](2.png)


### 2.3. Cấu trúc thư mục
Cấu trúc thư mục được tổ chức theo từng lớp chức năng (layer) của MVVM:

![alt text](1.png)

## ⚙️ CHƯƠNG 3: HƯỚNG DẪN CÀI ĐẶT VÀ SỬ DỤNG

### 3.1. Yêu cầu hệ thống
* Android Studio Iguana (2023.2.1) hoặc mới hơn.
* Android SDK 34 (Android 14).
* Thiết bị Android hoặc máy ảo (Emulator) chạy Android 8.0 (Oreo) trở lên.

### 3.2. Các bước cài đặt
1.  **Clone Repository**
    ```bash
    git clone [https://github.com/](https://github.com/)[TÊN_GITHUB_CỦA_BẠN]/[TÊN_REPO_CỦA_BẠN].git
    ```

2.  **Mở dự án**
    * Mở **Android Studio**.
    * Chọn `File` > `Open` và trỏ đến thư mục dự án bạn vừa clone.

3.  **Đồng bộ hóa Gradle**
    * Đợi Android Studio tự động tải về và đồng bộ hóa các thư viện (dependencies) đã khai báo trong file `build.gradle.kts`.

4.  **Chạy ứng dụng**
    * Nhấn nút `Run 'app'` (biểu tượng ▶ màu xanh lá) và chọn thiết bị (máy ảo hoặc máy thật) để chạy.

---

## 👤 4. Liên hệ

Dự án được thực hiện bởi:

* **Đỗ Huy Dũng**
    * MSV: 1671020065
    * Email: 1671020065@dnu.edu.vn
* **Nguyễn Đức Tâm**
    * MSV: 1671020280
    * Email: 1671020280@dnu.edu.vn

**Trường Đại học Đại Nam - Khoa Công nghệ thông tin**
