package com;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.core.env.Environment;

@SpringBootApplication(exclude = { SecurityAutoConfiguration.class })
public class KnotlyWeddingInvitationApplication {

    public static void main(String[] args) {
        // Get the application context to access environment
        var context = SpringApplication.run(KnotlyWeddingInvitationApplication.class, args);

        // Only open browser in local development (not on Azure)
        if (isLocalEnvironment()) {
            Environment env = context.getEnvironment();
            String port = env.getProperty("local.server.port", "8080");
            openBrowser("http://localhost:" + port);
        }
    }

    private static boolean isLocalEnvironment() {
        // Azure sets WEBSITE_INSTANCE_ID environment variable
        return System.getenv("WEBSITE_INSTANCE_ID") == null;
    }

    private static void openBrowser(String url) {
        try {
            Thread.sleep(2000);
            if (java.awt.Desktop.isDesktopSupported() &&
                    java.awt.Desktop.getDesktop().isSupported(java.awt.Desktop.Action.BROWSE)) {
                java.awt.Desktop.getDesktop().browse(new java.net.URI(url));
            } else {
                System.out.println("Open browser at: " + url);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}