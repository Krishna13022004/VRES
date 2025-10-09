package com.vres.service;

import java.sql.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.vres.entity.Notifications;
import com.vres.repository.NotificationsRepository;

@Service
public class NotificationService {

    @Autowired
    private NotificationsRepository notificationsRepository;

    
    public void createNotification(String channel, String recipient, String templateKey, String payload) {
        Notifications notification = new Notifications();
        notification.setChannel(channel);
        notification.setRecipient(recipient);
        notification.setTemplate_key(templateKey);
        notification.setPayload(payload);
        notification.setSent_at(new Date(System.currentTimeMillis())); // Set current time

        notificationsRepository.save(notification);

        System.out.println("LOG: Notification sent to " + recipient + " via " + channel);
    }

}
