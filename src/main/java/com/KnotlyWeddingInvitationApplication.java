package com;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.awt.Desktop;
import java.net.URI;

@SpringBootApplication
public class KnotlyWeddingInvitationApplication {

    public static void main(String[] args) {
        SpringApplication.run(KnotlyWeddingInvitationApplication.class, args);
        openBrowser("http://localhost:8080");
    }

    private static void openBrowser(String url) {
        try {
            Thread.sleep(2000); // Đợi 5 giây để chắc chắn server đã chạy
            if (Desktop.isDesktopSupported() && Desktop.getDesktop().isSupported(Desktop.Action.BROWSE)) {
                Desktop.getDesktop().browse(new URI(url));
            } else {
                System.out.println( url);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

}
