import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PushNotificationService } from '../../../core/services/push-notification.service';

@Component({
  selector: 'app-notification-settings',
  templateUrl: './notification-settings.component.html',
  styleUrls: ['./notification-settings.component.css']
})
export class NotificationSettingsComponent implements OnInit {
  isSubscribed = false;
  isLoading = false;
  isSupported = false;
  permissionStatus: NotificationPermission = 'default';

  constructor(private pushNotificationService: PushNotificationService) {}

  async ngOnInit(): Promise<void> {
    await this.checkSupport();
    await this.checkSubscriptionStatus();
    await this.checkPermissionStatus();
  }

  /**
   * Vérifier si les notifications push sont supportées
   */
  private async checkSupport(): Promise<void> {
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    console.log('🔍 Support des notifications:', this.isSupported);
  }

  /**
   * Vérifier le statut de l'abonnement
   */
  private async checkSubscriptionStatus(): Promise<void> {
    if (!this.isSupported) return;
    
    try {
      this.isSubscribed = await this.pushNotificationService.isSubscribed();
      console.log('🔍 Statut de l\'abonnement:', this.isSubscribed);
    } catch (error) {
      console.error('❌ Erreur lors de la vérification du statut:', error);
    }
  }

  /**
   * Vérifier le statut des permissions
   */
  private async checkPermissionStatus(): Promise<void> {
    if (!this.isSupported) return;
    
    this.permissionStatus = Notification.permission;
    console.log('🔍 Statut des permissions:', this.permissionStatus);
  }

  /**
   * S'abonner aux notifications push
   */
  async subscribeToNotifications(): Promise<void> {
    if (!this.isSupported) {
      alert('Les notifications push ne sont pas supportées par votre navigateur.');
      return;
    }

    this.isLoading = true;
    
    try {
      const subscription = await this.pushNotificationService.subscribeToPushNotifications();
      
      if (subscription) {
        this.isSubscribed = true;
        this.permissionStatus = 'granted';
        console.log('✅ Abonnement réussi:', subscription);
        alert('✅ Vous êtes maintenant abonné aux notifications push !');
      } else {
        console.error('❌ Échec de l\'abonnement');
        alert('❌ Impossible de s\'abonner aux notifications. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'abonnement:', error);
      alert('❌ Erreur lors de l\'abonnement aux notifications: ' + error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Se désabonner des notifications push
   */
  async unsubscribeFromNotifications(): Promise<void> {
    if (!this.isSupported) return;

    this.isLoading = true;
    
    try {
      const success = await this.pushNotificationService.unsubscribeFromPushNotifications();
      
      if (success) {
        this.isSubscribed = false;
        console.log('✅ Désabonnement réussi');
        alert('✅ Vous êtes maintenant désabonné des notifications push.');
      } else {
        console.error('❌ Échec du désabonnement');
        alert('❌ Impossible de se désabonner. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('❌ Erreur lors du désabonnement:', error);
      alert('❌ Erreur lors du désabonnement: ' + error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Tester l'envoi d'une notification
   */
  async testNotification(): Promise<void> {
    if (!this.isSubscribed) {
      alert('Vous devez d\'abord vous abonner aux notifications.');
      return;
    }

    this.isLoading = true;
    
    try {
      await firstValueFrom(this.pushNotificationService.testNotification(
        'Test de notification',
        'Ceci est un test de notification push !'
      ));
      
      console.log('✅ Notification de test envoyée');
      alert('✅ Notification de test envoyée !');
    } catch (error) {
      console.error('❌ Erreur lors du test:', error);
      alert('❌ Erreur lors de l\'envoi de la notification de test: ' + error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Obtenir le texte du statut
   */
  getStatusText(): string {
    if (!this.isSupported) {
      return 'Non supporté';
    }
    
    switch (this.permissionStatus) {
      case 'granted':
        return this.isSubscribed ? 'Abonné' : 'Permission accordée';
      case 'denied':
        return 'Refusé';
      case 'default':
        return 'Non demandé';
      default:
        return 'Inconnu';
    }
  }

  /**
   * Obtenir la classe CSS du statut
   */
  getStatusClass(): string {
    if (!this.isSupported) {
      return 'status-unsupported';
    }
    
    switch (this.permissionStatus) {
      case 'granted':
        return this.isSubscribed ? 'status-subscribed' : 'status-granted';
      case 'denied':
        return 'status-denied';
      case 'default':
        return 'status-default';
      default:
        return 'status-unknown';
    }
  }

  /**
   * Obtenir la description des permissions
   */
  getPermissionDescription(): string {
    switch (this.permissionStatus) {
      case 'granted':
        return this.isSubscribed ? 'Vous recevez des notifications push' : 'Vous pouvez recevoir des notifications';
      case 'denied':
        return 'Vous avez refusé les notifications. Modifiez les paramètres de votre navigateur.';
      case 'default':
        return 'Vous n\'avez pas encore choisi d\'autoriser ou refuser les notifications';
      default:
        return 'Statut inconnu';
    }
  }
}
