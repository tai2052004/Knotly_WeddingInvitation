package com.Services;

import com.Model.UsersDetail;
import com.Repositories.UsersDetailRepository;
import org.springframework.stereotype.Service;

@Service
public class UsersDetailService {
    public UsersDetailRepository repos;

    public UsersDetailService(UsersDetailRepository repos) {
        this.repos = repos;
    }
    public UsersDetail getDetailByUserId(Long userId) {
        return repos.findById(userId)
                .orElse(null);
    }
    public UsersDetail saveOrUpdate(UsersDetail details) {
        return repos.save(details);
    }
    public void updateUserAvatar(Long userid, String filename) {
        UsersDetail user = repos.findById(userid).orElse(null);
        if (user != null) {
            user.setAvatar(filename);
            repos.save(user);
        }
    }
}