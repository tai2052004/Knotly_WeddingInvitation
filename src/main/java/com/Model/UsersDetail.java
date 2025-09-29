package com.Model;
import jakarta.persistence.*;

import java.util.Date;
@Entity
@Table (name = "UsersDetail")
public class  UsersDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long userId;
    private String name;   // 🔹 Thêm field name
    private Date birthday;
    private String phone;
    private String gender;
    private String avatar;

    // ===== Constructors =====
    public UsersDetail() {}

    public UsersDetail(Long id, Long userId, String name, Date birthday, String phone, String gender, String avatar) {
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.birthday = birthday;
        this.phone = phone;
        this.gender = gender;
        this.avatar = avatar;
    }

    public UsersDetail(long userId, String name, Date birthday, String phone, String gender , String avartar) {
        this.userId = userId;
        this.name = name;
        this.birthday = birthday;
        this.phone = phone;
        this.gender = gender;
        this.avatar = avartar;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Date getBirthday() { return birthday; }
    public void setBirthday(Date birthday) { this.birthday = birthday; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    @Override
    public String toString() {
        return "UsersDetail{" +
                "id=" + id +
                ", userId=" + userId +
                ", name='" + name + '\'' +
                ", birthday=" + birthday +
                ", phone='" + phone + '\'' +
                ", gender=" + gender +
                '}';
    }
}
